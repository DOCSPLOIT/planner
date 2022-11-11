import { Controller, Req, Res } from "@docsploit/espress";
import { GET, POST, PUT, DELETE } from "@docsploit/espress/lib/methods";
import {
  sendErrorResponse,
  sendSuccessResponse,

} from "@docsploit/espress/lib/utils";
import { multerMultiFieldHandler } from "@docsploit/espress/lib/files"
import auth from "../../utils/Auth";
import { AuthContext } from "../auth/auth.model";
import Projects from "../project/project.model";
import Project_logs from "../project_logs/project_logs.controller";
import Tasks, { TaskStatus, TaskType } from "./task.model";
import validate from "@docsploit/espress/lib/validator";
import { validate as _validate } from 'uuid'
@Controller
export default class Task {
  @GET('', [auth()])
  async all(req: Req, res: Res) {
    try {
      const sprintId = req.query.sprint as string;
      if (!sprintId) {
        const tasks = await Tasks.findAll({});
        return sendSuccessResponse('success', tasks, res);
      } else {
        const tasks = await Tasks.findAll({ where: { sprintId } });
        return sendSuccessResponse('success', tasks, res);
      }
    } catch (error) {
      sendErrorResponse(500, 'Internal Server Error', res);
      throw error;
    }
  }
  @GET('/:id', [auth(),])
  async single(req: Req, res: Res) {
    try {
      if (!_validate(req.params.id)) {
        return sendErrorResponse(404, 'Issue Not found', res)
      }
      const id = req.params.id as string;
      const task = await Tasks.findOne({ where: { id } });
      if (!task) {
        return sendErrorResponse(404, 'Task not found', res);
      }
      return sendSuccessResponse('success', task, res);
    } catch (error) {

      sendErrorResponse(500, 'Internal Server Error', res);
      throw error;
    }
  }
  @POST<Omit<TaskType & { sprintId: string, projectId: string }, 'code'>>('', [auth(), multerMultiFieldHandler([{ name: 'att_1' }, { name: 'att_2' }, { name: 'att_3' }], 'public/attachments', ['image/jpeg', 'application/pdf', 'image/png', 'image/jpg',])])
  async create(req: Req & { user: AuthContext }, res: Res) {
    const schema = {
      type: 'object',
      properties: {
        issue: { type: 'string', minLength: 1, },
        description: { type: 'string', minLength: 1, },
        attachments: { type: 'array', items: { type: 'string' } },
        points: { type: 'string', minLength: 1, maxLength: 1 },
        sprintId: { type: 'string', },
        projectId: { type: 'string', },
        status: { type: 'string' },
        att_1: { type: 'string' },
        att_2: { type: 'string' },
        att_3: { type: 'string' },
      },
      required: ['issue', 'points', 'sprintId',],
      additionalProperties: false
    }
    const valid = validate(schema, req.body)
    if (valid === true) {
      try {
        const sprintId = req.body.sprintId as string;

        req.body.attachments = []
        if (req.body.att_1) {
          req.body.attachments.push(req.body.att_1)
        }
        if (req.body.att_2) {
          req.body.attachments.push(req.body.att_2)
        } if (req.body.att_3) {
          req.body.attachments.push(req.body.att_3)
        }



        const project = await Projects.findByPk(req.body.projectId);

        if (!project) {
          return sendErrorResponse(400, 'Project not found', res);
        }
        const projectCode = project.code;
        let code = '';
        const prev_task = await Tasks.findOne({ where: { projectId: req.body.projectId } });
        if (prev_task) {
          const prev_code = prev_task.code;
          const prev_code_split = prev_code.split('-');
          const prev_code_number = parseInt(prev_code_split[1]);
          const new_code_number = prev_code_number + 1;
          code = `${projectCode}-${new_code_number}`;
        } else {
          code = `${projectCode}-1`;
        }
        delete req.body.att_1; delete req.body.att_2; delete req.body.att_3;
        console.log(req.body);

        const task = await Tasks.create({
          ...req.body,
          code,
          sprintId,
        });
        await Project_logs.create({ log: `New Issue ${code} created`, projectId: req.body.projectId, userId: req.user.id })
        return sendSuccessResponse('success', task, res);
      } catch (error) {
        sendErrorResponse(500, 'Internal Server Error', res);
        throw error;
      }
    } else {
      return sendErrorResponse(400, { ...valid }, res)
    }

  }
  @PUT<TaskType & { sprintId: string }>('/:id', [auth()],)
  async update(req: Req & { user: AuthContext }, res: Res) {
    const schema = {
      type: 'object',
      properties: {
        issue: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: 'string', minLength: 1, maxLength: 255 },
        attachments: { type: 'array', items: { type: 'string' } },
        points: { type: 'string', minLength: 1, maxLength: 1 },
        sprintId: { type: 'string', },
        code: { type: 'string', minLength: 1, maxLength: 255 },
        status: { type: 'string', enum: [TaskStatus.TODO, TaskStatus.INPROGRESS, TaskStatus.DONE] }
      },
      required: [],
      additionalProperties: false
    }
    const valid = validate(schema, req.body)
    if (valid === true) {
      try {
        const id = req.params.id
        const issue = req.body
        const result = await Tasks.update(issue, { where: { id } })
        if (result[0] > 0) {
          switch (issue.status) {
            case TaskStatus.TODO:
              await Project_logs.create({ log: `Issue ${issue.code} moved to TODO`, projectId: issue.projectId, userId: req.user.id })
              break;
            case TaskStatus.INPROGRESS:
              await Project_logs.create({ log: `Issue ${issue.code} moved to IN PROGRESS`, projectId: issue.projectId, userId: req.user.id })
              break;
            case TaskStatus.DONE:
              await Project_logs.create({ log: `Issue ${issue.code} moved to DONE`, projectId: issue.projectId, userId: req.user.id })
              break;
          }
        }
        return sendSuccessResponse('success', result, res)
      } catch (error) {
        sendErrorResponse(500, 'Internal Server Error', res);
        throw error;
      }
    } else return sendErrorResponse(400, { ...valid }, res)
  }
  @DELETE('/:id', [auth()])
  async delete(req: Req, res: Res) {
    try {
      const id = req.params.id
      const result = await Tasks.destroy({ where: { id } })
      return sendSuccessResponse('success', result, res)
    } catch (error) {
      console.debug(error);
      return sendErrorResponse(500, 'Internal Server Error', res);
    }
  }
}
