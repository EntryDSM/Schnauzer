import { ErrorResponse } from "./error";

export const ApiNotFoundError = new ErrorResponse(404, "c01", "api not found");
export const InvalidParameterError = new ErrorResponse(
  400,
  "c02",
  "invalid parameter"
);

export const ExpiredOrInvalidTokenError = new ErrorResponse(
  401,
  "a01",
  "expired or invalid token"
);
export const UnknownUserError = new ErrorResponse(403, "a02", "unknown user");

export const DatabaseUpdateError = new ErrorResponse(
  400,
  "d01",
  "database update error"
);
