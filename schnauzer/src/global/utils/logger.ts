import * as winston from "winston";
import * as moment from "moment";
import { Logger } from "winston";
import { Request } from "express";

const httpTransports = [];
const socketTransports = [];
const tsFormat = moment().format("YYYY-MM-DD HH:mm:ss");

const consoleTransport = new winston.transports.Console({
  format: winston.format.printf(
    (info) => `[${info.level.toUpperCase()}] - ${info.message}`
  ),
  level: "debug",
});

httpTransports.push(consoleTransport);
socketTransports.push(consoleTransport);

//if (process.env.NODE_ENV !== "test") {
const fileBaseOptions = {
  zippedArchive: false,
  format: winston.format.printf(
    (info) => `${tsFormat} [${info.level.toUpperCase()}] - ${info.message}`
  ),
  dirname: "./logs",
  level: "info",
  maxsize: "50m",
};

httpTransports.push(
  new winston.transports.File(
    Object.assign({ filename: "http.log" }, fileBaseOptions)
  )
);

socketTransports.push(
  new winston.transports.File(
    Object.assign({ filename: "socket.log" }, fileBaseOptions)
  )
);
//}

const httpLoggerInstance = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: httpTransports,
});

const socketLoggerInstance = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: socketTransports,
});

export const httpLogger = new (class {
  constructor(private logger: Logger) {}

  public info(req: Request, status: number, message: string) {
    this.logger.info(
      `HTTP ${req.method} ${req.url} ${status} [${message}] ${req.ip.substring(
        7
      )} ${JSON.stringify({ ...req.query, ...req.params })}`
    );
  }

  public error(req: Request, error: Error) {
    this.logger.error(
      `HTTP ${req.method} ${req.url} 500 [${error.message}] ${req.ip.substring(
        7
      )} ${JSON.stringify({ ...req.query, ...req.params })}`
    );
  }
})(httpLoggerInstance);

export const socketLogger = new (class {
  constructor(private logger: Logger) {}

  public info(event: string, message: string, params: string) {
    this.logger.info(`SOCKET ${event} SUCCESS [${message}] ${params}`);
  }

  public error(event: string, message: string, params: string) {
    this.logger.info(`SOCKET ${event} FAIL [${message}] ${params}`);
  }
})(socketLoggerInstance);
