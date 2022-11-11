import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { v4 } from "uuid";
import { sequelize } from "../../utils/database";
import Projects from "../project/project.model";
import { Users } from "../user/user.model";



export interface ProjectLogModel extends Model<InferAttributes<ProjectLogModel>, InferCreationAttributes<ProjectLogModel, { omit: 'id' }>> {
    id: string;
    projectId: string;
    userId: string;
    log: string
}

const ProjectLogs = sequelize.define<ProjectLogModel>('project_logs', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: () => v4(),
    },
    log: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    projectId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'projects',
            key: 'id',
        },
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        }
    },
});

Projects.hasMany(ProjectLogs, { foreignKey: 'projectId' });
ProjectLogs.belongsTo(Projects, { foreignKey: 'projectId' });
Users.hasMany(ProjectLogs, { foreignKey: 'userId' });
ProjectLogs.belongsTo(Users, { foreignKey: 'userId' });

export default ProjectLogs;