import { verify } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { jwtSecret } from "../config";
import { HttpError } from "../error";

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    res.locals.jwtPayload = verify(
      req.get("Authorization").substring(7),
      jwtSecret
    );
    if (res.locals.jwtPayload.type === "refresh_token") {
      throw new HttpError("토큰 타입 불일치", 403);
    }
    next();
  } catch (e) {
    if (e instanceof HttpError) {
      return next(e);
    }
    next(new HttpError("만료되었거나 유효하지 않은 토큰", 401));
  }
};
