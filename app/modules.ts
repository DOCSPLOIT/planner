import Project_logs from "./project_logs/project_logs.controller";
import Sprint from "./sprint/sprint.controller";
import Task from "./task/task.controller";
import Project from "./project/project.controller";
import User from "./user/user.controller";
import Auth from "./auth/auth.controller";
import { register } from "@docsploit/espress";

// register modules here
register("/auth", Auth);
register("/user", User);
register("/project", Project);
register("/task", Task);
register("/sprint", Sprint);
register("/project_logs", Project_logs);

export default this;
