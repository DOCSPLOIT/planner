import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { v4 } from "uuid";
import { sequelize } from "../../utils/database";
import Projects from "../project/project.model";
import Sprints from "../sprint/sprint.model";

export type TaskType = {
    issue: string;
    description: string;
    code: string
    attachments: string[];
    points: string
    status: TaskStatus
};
// Any model related works should be done here.
export enum TaskStatus {
    TODO = 'TODO',
    INPROGRESS = 'INPROGRESS',
    DONE = 'DONE'
}

export interface TaskModel extends Model<InferAttributes<TaskModel>, InferCreationAttributes<TaskModel>>, TaskType {
    id: string
    sprintId: string
    projectId: string
}

const Tasks = sequelize.define<TaskModel>("task", {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
    },
    issue: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,

    },
    attachments: {
        type: DataTypes.ARRAY(DataTypes.STRING),

    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    points: {
        type: DataTypes.STRING,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sprintId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "sprints",
            key: "id",
        }
    },
    projectId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "projects",
            key: "id",
        }
    }

})

Sprints.hasMany(Tasks, { onDelete: 'CASCADE' });
Projects.hasMany(Tasks, { onDelete: 'CASCADE' });

export default Tasks;