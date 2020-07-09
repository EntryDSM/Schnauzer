import { verify } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { jwtSecret } from "../global/config";
import {
  InvalidTokenTypeError,
  ExpiredOrInvalidTokenError,
} from "../global/error/errorCode";

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    res.locals.jwtPayload = verify(
      req.get("Authorization").substring(7),
      jwtSecret
    );
    if (res.locals.jwtPayload.type === "refresh_token") {
      throw InvalidTokenTypeError;
    }
    next();
  } catch (e) {
    if (e === InvalidTokenTypeError) {
      return next(e);
    }
    next(ExpiredOrInvalidTokenError);
  }
};
