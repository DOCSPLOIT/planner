import { Controller, Req, Res } from "@docsploit/espress";
import validate from "@docsploit/espress/lib/validator";
import { GET, POST, PUT, DELETE } from "@docsploit/espress/lib/methods";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "@docsploit/espress/lib/utils";
import ProjectLogs from "./project_logs.model";
import auth from "../../utils/Auth";
@Controller
export default class Project_logs {
  @GET('', [auth()])
  async getAll(req: Req, res: Res) {
    try {
      const limit = parseInt(req.query.limit as string) || 10 as number;
      const projectId = req.query.projectId as string;
      if (projectId) {
        const logs = await ProjectLogs.findAll({ where: { projectId }, limit });
        return sendSuccessResponse('success', logs, res);
      } else {
        return sendErrorResponse(400, "Project not found", res);
      }

    } catch (error) {
      console.debug(error);
    }
  }


  static async create(data: { projectId: string, userId: string, log: string }) {
    try {
      const schema = {
        type: 'object',
        properties: {
          projectId: { type: 'string', minLength: 1, maxLength: 255 },
          userId: { type: 'string', minLength: 1, maxLength: 255 },
          log: { type: 'string', minLength: 1, maxLength: 255 },
        },
        required: ['projectId', 'userId', 'log'],
      }
      const valid = validate(schema, data);
      if (valid === true) {
        await ProjectLogs.create(data);
      } else {
        console.log(valid);
      }
    } catch (error) {
      console.debug(error);
    }
  }
}
