import express, { Application } from 'express'

class App {
  private app: Application;

  constructor() {
    this.app = express();

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  public listen(port: number) {
    this.app.listen(port);
  }
}

export default new App();