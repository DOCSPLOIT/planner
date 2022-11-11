import { Controller, Req, Res } from "@docsploit/espress";
import { GET, POST, PUT, DELETE } from "@docsploit/espress/lib/methods";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "@docsploit/espress/lib/utils";
import { validate } from "uuid";
import auth from "../../utils/Auth";
import { AuthContext } from "../auth/auth.model";
import Projects from "../project/project.model";
import Project_logs from "../project_logs/project_logs.controller";
import Sprints, { SprintStatus, SprintType } from "./sprint.model";
@Controller
export default class Sprint {
  @GET<{ projectId: string }>('', [auth()], {
    type: "object",
    properties: {
      projectId: { type: "string" },
    },
    required: ["projectId"],
  })
  async all(req: Req, res: Res) {
    try {
      const projectId = req.query.projectId as string;
      const project = await Projects.findByPk(projectId);
      if (project) {
        const sprints = await Sprints.findAll({ where: { projectId } });
        return sendSuccessResponse('success', sprints, res);
      } else {
        return sendErrorResponse(400, "Project not found", res);
      }
    } catch (error) {
      sendErrorResponse(500, 'Internal Server Error', res);
      throw error;
    }
  }
  @GET('/:id', [auth()])
  async single(req: Req, res: Res) {
    try {
      if (!validate(req.params.id)) {
        return sendErrorResponse(404, 'Sprint Not found', res)
      }
      const id = req.params.id
      const result = await Sprints.findByPk(id)
      return sendSuccessResponse('success', result, res)
    } catch (error) {
      sendErrorResponse(500, 'Internal Server Error', res);
      throw error;
    }
  }
  @POST<SprintType & { projectId: string }>('', [auth()], {
    type: "object",
    properties: {
      name: { type: "string" },
      startDate: { type: "string" },
      endDate: { type: "string" },
      projectId: { type: "string" },
      status: { type: "string", enum: [SprintStatus.COMPLETED, SprintStatus.INPROGRESS, SprintStatus.NOT_STARTED, SprintStatus.OVERDUE] },
      goals: { type: "array", items: { type: "string" } },
    },
    required: ["name", "projectId", "goals", "status"],
    additionalProperties: false
  })
  async create(req: Req & { user?: AuthContext }, res: Res) {
    try {
      const sprint = req.body;
      const project = await Projects.findByPk(sprint.projectId);
      if (project) {
        const result = await Sprints.create(sprint);
        await Project_logs.create({ log: `${sprint.name} created`, projectId: sprint.projectId, userId: req.user?.id })
        return sendSuccessResponse('success', result, res);
      } else {
        return sendErrorResponse(400, "Project not found", res);
      }
    } catch (error) {
      sendErrorResponse(500, 'Internal Server Error', res);
      throw error;
    }
  }
  @PUT<SprintType & { projectId: string }>('/:id', [auth()], {
    type: "object",
    properties: {
      name: { type: "string" },
      startDate: { type: "string" },
      endDate: { type: "string" },
      projectId: { type: "string" },
      status: {
        type: "string",
        status: { type: "string", enum: [SprintStatus.COMPLETED, SprintStatus.INPROGRESS, SprintStatus.NOT_STARTED, SprintStatus.OVERDUE] },
      },
      goals: { type: "array", items: { type: "string" } },
    },
    required: [],
    additionalProperties: false
  })
  async update(req: Req & { user?: AuthContext }, res: Res) {
    try {
      let log = '';
      const id = req.params.id
      const sprint = req.body
      const result = await Sprints.update(sprint, { where: { id } })
      switch (sprint.status) {
        case SprintStatus.COMPLETED: {
          log = `${sprint.name} moved to COMPLETED`
        }
          break;
        case SprintStatus.INPROGRESS: {
          log = `${sprint.name} moved to IN PROGRESS`
        }
          break;
        case SprintStatus.NOT_STARTED: {
          log = `${sprint.name} moved to NOT STARTED`
        }
          break;
        case SprintStatus.OVERDUE: {
          log = `${sprint.name} moved to OVERDUE`
        }
          break;
      }
      await Project_logs.create({ log, projectId: sprint.projectId, userId: req.user?.id });
      return sendSuccessResponse('success', result, res)
    } catch (error) {
      sendErrorResponse(500, 'Internal Server Error', res);
      throw error;
    }
  }
  @DELETE('/:id', [auth()])
  async delete(req: Req, res: Res) {
    try {
      const id = req.params.id
      const result = Sprints.destroy({ where: { id } })
      return sendSuccessResponse('success', result, res)
    } catch (error) {
      throw error;
      return sendErrorResponse(500, 'Internal Server Error', res);
    }
  }
}
