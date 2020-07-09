import { ErrorRequestHandler } from "express";
import { Error } from "../global/error/error";

export const errorHandler: ErrorRequestHandler = (
  err: Error,
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
