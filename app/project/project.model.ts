import { sequelize } from "../../utils/database";
import { DataTypes, ForeignKey, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import { v4 } from 'uuid';
export type ProjectType = {
    name: string
    description: string
    estimatedTaskTime: string
    code: string
    status: string
};
export interface ProjectsModel extends Model<InferAttributes<ProjectsModel>, InferCreationAttributes<ProjectsModel>>, ProjectType {
    id: string
}

const Projects = sequelize.define<ProjectsModel>('projects', {
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
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    estimatedTaskTime: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
    },
});

export default Projects;
