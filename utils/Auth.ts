import { Req, Res } from "@docsploit/espress";
import { getEnv } from "@docsploit/espress/lib/utils";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthContext, AuthProvider } from "../app/auth/auth.model";



/**
 * 
 * @param authParam 
 * @returns 
 */
const auth = (authParam?: AuthProvider | any) => {
  return (req: Req & { user?: AuthContext }, res: Res, next: Function) => {

    if ((req.session as any).token) {

      try {
        const valid = jwt.verify((req.session as any).token, getEnv('ACCESS_SECRET'));
        req.user = valid as any;
        return next();

      } catch (error: any) {
        console.log(error);

        return res.status(403).json({});

      }
    } else {
      console.log("UnAuthorizedException : Session NotFound");
      return res.status(403).json({});
    }
  }
}
export default auth;



export const createAccessToken = (payload: any) =>
  jwt.sign(payload, getEnv('ACCESS_SECRET'), {
  });
