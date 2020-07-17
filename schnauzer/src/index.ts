import { createConnection } from "typeorm";
import app from "./app";
import { serverPort } from "./global/config";

createConnection()
  .then(() => {
    app.listen(serverPort);
  })
  .catch((err) => console.error(err));
