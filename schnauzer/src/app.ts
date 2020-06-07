import "reflect-metadata";
import * as express from "express";
import { Application } from "express";

class App {
  private readonly app: Application;

  constructor() {
    this.app = express();

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  public listen(port: number) {
    this.app.listen(port);
  }

  get application() {
    return this.app;
  }
}

export default new App();
