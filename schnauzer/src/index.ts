import { createConnection } from "typeorm";
import app from "./app";
import { dbOptions, serverPort } from "./global/config";

createConnection(dbOptions.CONNECTION_NAME)
  .then(() => {
    app.listen(serverPort);
  })
  .catch((err) => console.error(err));