import { ConnectionOptions } from "typeorm";
import { dbOptions } from "./src/global/config";

const option: ConnectionOptions = {
  type: "mysql",
  host: dbOptions.DB_HOST,
  port: Number(dbOptions.DB_PORT),
  username: dbOptions.DB_USER,
  password: dbOptions.DB_PASSWORD,
  database: dbOptions.DB_NAME,
  synchronize: false,
  logging: false,
  entities: ["./src/entity/**/*.ts"],
};

export = option;
