import { getConnection as getConnectionWithName } from "typeorm";
import { dbOptions } from "../global/config";

export const getConnection = () => {
  return getConnectionWithName(dbOptions.CONNECTION_NAME);
};
