import { ErrorRequestHandler } from "express";
import { ErrorResponse } from "../global/error/error";
import { httpLogger } from "../global/utils/logger";

export const errorHandler: ErrorRequestHandler = (
  err: ErrorResponse,
  req,
  res,
  next
) => {
  if (!err.status) {
    httpLogger.error(req, err);
  } else {
    httpLogger.info(req, err.status, err.message);
  }
  res.status(err.status || 500).json({
    message: err.message || "internal server error",
    status: err.status || 500,
    code: err.code || "c03",
  });
};
