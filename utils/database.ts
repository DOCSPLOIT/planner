import { Sequelize } from "sequelize";
import { getEnv } from '@docsploit/espress/lib/utils'
export const sequelize = new Sequelize(getEnv('DB'), {
    logging: false, dialectOptions: {
        ssl: true
    }
});
export async function database(sync: boolean = false) {
    try {
        await sequelize.authenticate();
        console.log("Connected to database");
        if (sync) {
            await sequelize.sync({ alter: true });
            console.log('Sequelize has been synced');
        }
    } catch (error) {
        console.log(error)
    }
}