import { createConnection } from "typeorm";
import app from "./app";
import { serverPort } from "./config";

createConnection()
  .then(() => {
    app.listen(serverPort);
  })
  .catch((err) => console.error(err));
