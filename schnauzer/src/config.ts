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
  CONNECTION_NAME,
  SERVER_PORT,
} = process.env;

export const dbOptions = {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  CONNECTION_NAME,
};

export const serverPort = Number(SERVER_PORT);
