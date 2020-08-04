import "reflect-metadata";
import * as express from "express";
import { Application, NextFunction, Request, Response } from "express";
import * as SocketIO from "socket.io";
import { Server as IO } from "socket.io";
import { Server, createServer } from "http";
import * as cors from "cors";
import socketInit from "./socket/index";
import router from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { ApiNotFoundError } from "./global/error/errorCode";

class App {
  private app: Application;
  private httpServer: Server;
  private io: IO;

  constructor() {
    this.createApp();
  }

  private createApp(): void {
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cors());

    this.app.use("/v5/qna", router);

    this.app.use((req: Request, res: Response, next: NextFunction) => {
      next(ApiNotFoundError);
    });

    this.app.use(errorHandler);
  }

  private createServer(port: number): void {
    this.httpServer = createServer(this.app);
    this.httpServer.listen(port);
  }

  private socket() {
    this.io = SocketIO.listen(this.httpServer);
    socketInit(this.io);
  }

  public listen(port: number) {
    this.createServer(port);
    this.socket();
  }

  get application() {
    return this.app;
  }
}

export default new App();
