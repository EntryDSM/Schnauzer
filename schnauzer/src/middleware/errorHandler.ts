import { ErrorRequestHandler } from "express";
import { ErrorResponse } from "../global/error/error";
import logger from "../global/utils/logger";

export const errorHandler: ErrorRequestHandler = (
  err: ErrorResponse,
  req,
  res,
  next
) => {
  if (!err.status) {
    logger.emerg(`${req.method} ${req.url} 500 ${err.message}`);
  } else {
    logger.error(`${req.method} ${req.url} ${err.status} ${err.message}`);
  }
  res.status(err.status || 500).json({
    message: err.message || "internal server error",
    status: err.status || 500,
    code: err.code || "c03",
  });
};
