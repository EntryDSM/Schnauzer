import { config } from "dotenv";
if (process.env.NODE_ENV === "test") {
  config();
}
const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  SERVER_PORT,
  MAIN_JWT_SECRET,
  ADMIN_JWT_SECRET,
} = process.env;

export const dbOptions = {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
};

export const serverPort = Number(SERVER_PORT);
export const adminJwtSecret = ADMIN_JWT_SECRET;
export const mainJwtSecret = MAIN_JWT_SECRET;
