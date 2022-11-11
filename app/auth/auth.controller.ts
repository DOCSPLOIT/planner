import { Controller, Req, Res } from "@docsploit/espress";
import { GET, POST, PUT, DELETE } from "@docsploit/espress/lib/methods";
import {
  getEnv,
  sendErrorResponse,
  sendSuccessResponse,
} from "@docsploit/espress/lib/utils";
import { createAccessToken } from "../../utils/Auth";
import signupTemplate from "../../utils/email_templates/signup.template";
import { comparePassword, hashPassword, sendMail } from "../../utils/wrappers";
import { Users, UserType } from "../user/user.model";
import { ValidationEntryStatus_Success, VerifaliaRestClient } from "verifalia";
import { sign, verify } from "jsonwebtoken";
import forgotPasswordTemplate from "../../utils/email_templates/forgotPassword.template";

@Controller
export default class Auth {

  @POST<{ email: string, password: string }>('/login', [], {
    type: "object",
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string" },
    },
    required: ["email", "password"],
  }, [{ response: { message: 'success' }, reason: 'Success', status: 200 }], '{email:joedoe@gmail.com,password:12345}')
  async login(req: Req, res: Res) {
    const { email, password } = req.body;
    try {
      const user = await Users.findOne({ where: { email } });

      if (user && user.verified) {
        if (comparePassword(password, user.password)) {
          const payload = { id: user.id, email: user.email, name: user.name };
          console.log(req.session);

          (req.session as any).token = createAccessToken(payload)
          return sendSuccessResponse("success", undefined, res);
        } else {
          return sendErrorResponse(400, "Invalid credentials", res);
        }
      } else {
        return sendErrorResponse(400, "Account is not verified", res);
      }
    } catch (error: any) {
      console.log(error);

      return sendErrorResponse(500, 'Internal Server Error', res);
    }
  }

  @POST<Omit<UserType, 'verified'>>('/signup', [], {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string", format: "email" },
      password: { type: "string" },
    },
    required: ["name", "email", "password"],
    additionalProperties: false,
  })
  async signup(req: Req, res: Res) {
    const user = req.body;
    try {
      const verifalia = new VerifaliaRestClient({ username: getEnv('VERIFALIA_USERNAME'), password: getEnv('VERIFALIA_PASSWORD') });
      const verification = await verifalia.emailValidations.submit(user.email, true);
      if (verification?.entries[0].status == ValidationEntryStatus_Success) {
        user.password = hashPassword(user.password);
        const response = await Users.create({ ...user, verified: false });
        const verificationTOken = sign(response.id, getEnv('VERIFICATION_SECRET'));
        await sendMail(signupTemplate(response.name, getEnv('DOMAIN') + '/api/auth/verify/' + verificationTOken), 'Verify your email', response.email);
        return sendSuccessResponse("Verification Email Sent", undefined, res);
      } else {
        return sendErrorResponse(400, { message: "Invalid Email" }, res);
      }
    } catch (error: any) {
      console.error(error);

      if (error.name === "SequelizeUniqueConstraintError") {
        return sendErrorResponse(400, { message: "User already exists" }, res);
      }
      return sendErrorResponse(500, 'Internal Server Error', res);
    }
  }

  @GET('/verify/:token', [])
  async verification(req: Req, res: Res) {
    const token = req.params.token;
    try {
      const id = verify(token, getEnv('VERIFICATION_SECRET'));
      const user = await Users.findOne({ where: { id } });
      if (user) {
        user.verified = true;
        await user.save();
        return res.redirect(getEnv('DOMAIN') + '/login');
      } else {
        return sendErrorResponse(400, { message: "Invalid Token" }, res);
      }
    } catch (error: any) {
      sendErrorResponse(500, 'Internal Server Error', res);
      throw error;
    }

  }
  @POST<{ email: string }>('/forgot-password', [], {
    type: "object",
    properties: {
      email: { type: "string", format: "email" },
    },
    required: ["email"],
  })
  async forgot(req: Req, res: Res) {
    const { email } = req.body;
    try {
      let user = await Users.findOne({ where: { email, verified: true } });
      if (user) {
        const user_json = user.toJSON();
        const verificationTOken = sign({ id: user_json.id }, getEnv('VERIFICATION_SECRET'), { expiresIn: '5m' });
        await sendMail(forgotPasswordTemplate(user.name, getEnv('DOMAIN') + '/api/auth/reset-password/' + verificationTOken), 'Reset Password', user.email);
        return sendSuccessResponse("Reset Password Email Sent", undefined, res);
      } else {
        return sendErrorResponse(400, { message: "No user exist with this email / Account is not verified yet" }, res);
      }
    } catch (error: any) {
      sendErrorResponse(500, 'Internal Server Error', res);
      throw error;
    }
  }
  @GET('/reset-password/:token', [])
  async verify(req: Req, res: Res) {

    const token = req.params.token;
    try {
      const { id } = verify(token, getEnv('VERIFICATION_SECRET')) as { id: string };
      const user = await Users.findOne({ where: { id } });
      if (user) {
        return res.redirect('/resetPassword/' + token);
      } else {
        return sendErrorResponse(400, { message: "Invalid Token" }, res);
      }
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.send('<h4>Session Expired</h4>')
      }
      sendErrorResponse(500, 'Internal Server Error', res);
      throw error;
    }

  }

  @POST<{ password: string, }>('/reset-password', [], {
    type: "object",
    properties: {
      password: { type: "string" },
    },
    required: ["password",],
  })
  async reset(req: Req, res: Res) {
    const { password, token } = req.body;
    try {
      const { id } = verify(token, getEnv('VERIFICATION_SECRET')) as any;
      const user = await Users.findOne({ where: { id } });
      if (user) {
        let hash = hashPassword(password);
        Users.update({ password: hash }, { where: { id } });
        return sendSuccessResponse("Password Reset Successful", undefined, res);
      } else {
        return sendErrorResponse(400, { message: "Invalid Token" }, res);
      }
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return sendErrorResponse(400, { message: "Session Expired" }, res);
      }
      sendErrorResponse(500, 'Internal Server Error', res);
      throw error;
    }
  }

  @GET('/logout', [])
  async logout(req: Req, res: Res) {
    return req.session.destroy((err) => {
      if (err) {
        return res.redirect('/login')
      } else {
        return sendSuccessResponse('success', undefined, res)
      }
    });
  }
}
