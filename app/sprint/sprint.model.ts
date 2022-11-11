import { DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { v4 } from "uuid";
import { sequelize } from "../../utils/database";
import Projects, { ProjectsModel } from "../project/project.model";

export type SprintType = {
    status: SprintStatus
    name: string
    startDate: string
    endDate: string
    goals: string[]
};
// Any model related works should be done here.
export enum SprintStatus {
    COMPLETED = 'COMPLETED',
    INPROGRESS = 'INPROGRESS',
    NOT_STARTED = 'NOT STARTED',
    OVERDUE = 'OVERDUE'
}
export interface SprintModel extends Model<InferAttributes<SprintModel>, InferCreationAttributes<SprintModel>>, SprintType {
    id: string
    projectId: ForeignKey<ProjectsModel['id']>
}

const Sprints = sequelize.define<SprintModel>('sprint', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,

    },

    startDate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    endDate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: SprintStatus.NOT_STARTED,
    },
    goals: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
    },
    projectId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Projects,
            key: 'id',
        }
    }
});

Projects.hasMany(Sprints, { onDelete: 'CASCADE' });
Sprints.belongsTo(Projects);

export default Sprints;