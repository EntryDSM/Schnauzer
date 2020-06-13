import { ErrorRequestHandler } from "express";
import { HttpError } from "../error";

export const errorHandler: ErrorRequestHandler = (
  err: HttpError,
  req,
  res,
  next
) => {
  res.status(err.status || 500).json({
    message: err.message || "internal server error",
    status: err.status || 500,
  });
};
