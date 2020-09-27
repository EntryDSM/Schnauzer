import { createConnection } from "typeorm";
import app from "./app";
import { serverPort } from "./global/config";

createConnection()
  .then(() => {
    app.listen(serverPort, () =>
      console.log(`Listening on port ${serverPort}`)
    );
  })
  .catch((err) => console.error(err));
