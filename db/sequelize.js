import { Sequelize } from "sequelize";
let sequelize;
try {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
  });
} catch (error) {
  console.error(error);
}
export { sequelize };
