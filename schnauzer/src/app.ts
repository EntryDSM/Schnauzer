import "reflect-metadata";
import * as express from "express";
import { Application, NextFunction, Request, Response } from "express";
import router from "./routes";
import { HttpError } from "./error";

class App {
  private readonly app: Application;

  constructor() {
    this.app = express();

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use("/", router);

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      next(new HttpError("Not Found", 404));
    });

    this.app.use(
      (err: HttpError, req: Request, res: Response, next: NextFunction) => {
        res.status(err.status || 500).json({
          message: err.message,
          status: err.status,
        });
      }
    );
  }

  public listen(port: number) {
    this.app.listen(port);
  }

  get application() {
    return this.app;
  }
}

export default new App();
