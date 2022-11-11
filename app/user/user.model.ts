
export type UserType = {
    name: string;
    email: string;
    password: string;
    verified: boolean;
}

import { InferAttributes, InferCreationAttributes, Model, DataTypes, ForeignKey } from "sequelize";
import { v4 } from 'uuid';
import { sequelize } from "../../utils/database";
import Projects, { ProjectsModel } from "../project/project.model";


export interface UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>>, UserType {
    id: string
}

export const Users = sequelize.define<UserModel>('user', {
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
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'email'
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

interface Contributors extends Model<InferAttributes<Contributors>, InferCreationAttributes<Contributors>> {
    projectId: ForeignKey<ProjectsModel['id']>
    userId: ForeignKey<UserModel['id']>
    role: 'OWNER' | 'USER'
}

export const Contributors = sequelize.define<Contributors>("contributors", {
    projectId: {
        type: DataTypes.UUID,
        references: {
            model: Projects,
            key: "id",
        }
    },
    userId: {
        type: DataTypes.UUID,
        references: {
            model: Users,
            key: "id",
        }

    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'USER',
    }
});

Users.hasMany(Contributors, { onDelete: 'CASCADE' });
Contributors.belongsTo(Users);
Projects.hasMany(Contributors, { onDelete: 'CASCADE' });
Contributors.belongsTo(Projects);
