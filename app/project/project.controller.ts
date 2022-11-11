import { Controller, Req, Res } from "@docsploit/espress";
import { GET, POST, PUT, DELETE } from "@docsploit/espress/lib/methods";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "@docsploit/espress/lib/utils";
import { validate } from "uuid";
import auth from "../../utils/Auth";
import { AuthContext } from "../auth/auth.model";
import Sprints, { SprintStatus } from "../sprint/sprint.model";
import Tasks, { TaskStatus } from "../task/task.model";
import { Contributors, Users } from "../user/user.model";
import Projects, { ProjectType } from "./project.model";
@Controller
export default class Project {
  @GET('', [auth()],)
  async all(req: Req & { user: AuthContext }, res: Res) {
    try {
      const result = await Contributors.findAll({
        where: { userId: req.user.id }, include: [
          {
            model: Projects,
            attributes: ['id', 'name', 'description', 'estimatedTaskTime', 'code', 'status', 'createdAt',],
          },
          {
            model: Users,
            attributes: ['id', 'name', 'email',]
          }
        ],
        order: [['role', 'DESC']]
      });
      sendSuccessResponse('success', result, res);
    } catch (error) {
      console.debug(error);
      return sendErrorResponse(500, 'Internal Server Error', res);


    }
  }
  @GET('/:id', [auth()])
  async single(req: Req, res: Res) {
    try {
      if (!validate(req.params.id)) {
        return sendErrorResponse(404, 'Project Not found', res)
      }
      const result = await Projects.findByPk(req.params.id);
      let meta: any = {
        hasActiveSprint: false,
      };

      if (result) {
        if (req.query.status) {

          const sprint = await Sprints.findOne({ where: { projectId: req.params.id, status: SprintStatus.INPROGRESS } });
          const taskCount = await Tasks.count({ where: { projectId: req.params.id, } });
          const done_taskCount = await Tasks.count({ where: { projectId: req.params.id, status: TaskStatus.DONE } });
          if (sprint) {

            const in_progress_count = await Tasks.count({ where: { sprintId: sprint?.id, status: TaskStatus.INPROGRESS } });
            const completed_count = await Tasks.count({ where: { sprintId: sprint?.id, status: TaskStatus.DONE } });
            const todo_count = await Tasks.count({ where: { sprintId: sprint?.id, status: TaskStatus.TODO } });

            meta = {
              hasActiveSprint: true,
              currentSprint: {
                id: sprint.id,
                name: sprint.name,
                start: sprint.startDate,
                end: sprint.endDate,
                goals: sprint.goals
              },
              percentile: Math.round((done_taskCount ?? 0 / taskCount ?? 0) * 100) ?? 0,
              count: {
                inprogress: in_progress_count,
                completed: completed_count,
                todo: todo_count,
                total: in_progress_count + completed_count + todo_count,
              }
            }
          }
        }
        const final = result.toJSON();
        sendSuccessResponse('success', { ...final, ...(req.query.status && meta) }, res);
      } else {
        return sendErrorResponse(400, 'Project not found', res);

      }
    } catch (error: any) {
      console.log(error);

      return sendErrorResponse(500, 'Internal Server Error', res);
    }
  }
  @POST<ProjectType & { contributors: string[], userId: string }>('', [auth()], {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      estimatedTaskTime: { type: 'string' },
      code: { type: 'string' },
      status: { type: 'string' },
      userId: { type: 'string' },
      contributors: { type: 'array', items: { type: 'string' }, nullable: false }
    },
    required: ['name', 'description', 'estimatedTaskTime', 'code',],
    additionalProperties: false,
  })
  async create(req: Req & { user: AuthContext }, res: Res) {
    try {
      req.body.status = "IN PROGRESS";
      req.body.userId = req.user.id;
      const { contributors } = req.body;
      const project = await Projects.create({ ...req.body, userId: req.user.id });
      if (contributors && contributors.length > 0) {
        const contrib = contributors.map((contributor: string) => ({ projectId: project.id, userId: contributor, role: 'GUEST' }));
        contrib.push({ projectId: project.id, userId: req.user.id, role: 'OWNER' });
        await Contributors.bulkCreate(contrib);
      } else {
        await Contributors.create({ projectId: project.id, userId: req.user.id, role: 'OWNER' });
      }
      return sendSuccessResponse('success', project, res);
    } catch (error) {
      sendErrorResponse(500, 'Internal Server error', res)
      throw error;
    }
  }

  @PUT<ProjectType & { contributors: string[] }>('/:id', [auth()], {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      estimatedTaskTime: { type: 'string' },
      code: { type: 'string' },
      status: { type: 'string' },
      contributors: { type: 'array', items: { type: 'string' }, nullable: false },
    },
    required: [],
  })
  async update(req: Req & { user: AuthContext }, res: Res) {
    try {
      const project = await Projects.findByPk(req.params.id);
      if (project) {
        const result = await Projects.update(req.body, { where: { id: req.params.id }, returning: true });
        if (result[0] === 1) {
          return sendSuccessResponse('success', result[0], res);
        } else {
          return sendSuccessResponse('success', result[0], res);
        }
      } else {
        return sendErrorResponse(404, 'Project not found', res);
      }
    } catch (error) {
      sendErrorResponse(500, 'Internal Server Error', res);
      throw error;
    }
  }
  @DELETE('/:id', [auth()])
  async delete(req: Req, res: Res) {
    try {
      const project = await Projects.findByPk(req.params.id);
      if (project) {
        const result = await Projects.destroy({ where: { id: req.params.id } });
        if (result === 1) {
          return sendSuccessResponse('success', result, res);
        }
      } else {
        return sendErrorResponse(404, 'Project not found', res);
      }
    } catch (error) {
      sendErrorResponse(500, 'Internal Server Error', res);
      throw error;
    }
  }
}
