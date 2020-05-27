import { ConnectionOptions } from "typeorm";

const option: ConnectionOptions = {
  type: 'mysql',
  host: '',
  port: 3306,
  username: '',
  password: '',
  database: '',
  synchronize: true,
  logging: false,
  entities: ["src/entity/**/*.ts"],
}

export = option;