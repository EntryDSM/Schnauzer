import { ConnectionOptions } from "typeorm";
import { dbOptions } from "./src/global/config";
import { User } from "./src/entity/user";
import { Admin } from "./src/entity/admin";
import { Qna } from "./src/entity/qna";

const option: ConnectionOptions = {
  type: "mysql",
  host: dbOptions.DB_HOST,
  port: Number(dbOptions.DB_PORT),
  username: dbOptions.DB_USER,
  password: dbOptions.DB_PASSWORD,
  database: dbOptions.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [User, Admin, Qna],
};

export = option;
