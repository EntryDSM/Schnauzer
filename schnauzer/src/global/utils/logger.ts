import * as winston from "winston";

const logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [
    new winston.transports.Console({
      format: winston.format.printf(
        (info) => `[${info.level.toUpperCase()}] ${info.message}`
      ),
    }),
  ],
});

export default logger;
