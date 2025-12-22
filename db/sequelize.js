import { Sequelize } from "sequelize";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const caPath = path.join(__dirname, "../certs/prod-ca-2021.crt");
const ca = fs.readFileSync(caPath);

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true, // IMPORTANT
      ca: ca,
    },
  },
});
