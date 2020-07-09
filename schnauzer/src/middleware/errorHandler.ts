import { ErrorRequestHandler } from "express";
import { ErrorResponse } from "../global/error/error";

export const errorHandler: ErrorRequestHandler = (
  err: ErrorResponse,
  req,
  res,
  next
) => {
  res.status(err.status || 500).json({
    message: err.message || "internal server error",
    status: err.status || 500,
    code: err.code || "s00",
  });
};
