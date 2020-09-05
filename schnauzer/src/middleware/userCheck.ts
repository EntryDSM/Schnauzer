import { NextFunction, Request, Response } from "express";
import { User } from "../entity/user";
import { getConnection } from "typeorm";
import {
  ExpiredOrInvalidTokenError,
  UnknownUserError,
} from "../global/error/errorCode";
import { Admin } from "../entity/admin";
import { JsonWebTokenError, TokenExpiredError, verify } from "jsonwebtoken";
import { adminJwtSecret, mainJwtSecret } from "../global/config";
import hasNullOrUndefined from "../global/utils/paramsCheck";

export const isUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token = req.get("Authorization");
    if (hasNullOrUndefined([token])) {
      throw ExpiredOrInvalidTokenError;
    }
    const secret = Buffer.from(mainJwtSecret, "base64");
    const payload: any = verify(token.substring(7), secret.toString());
    if (payload.type !== "access_token") {
      throw ExpiredOrInvalidTokenError;
    }
    const connection = getConnection();
    const userRepo = connection.getRepository(User);
    if (!(await userRepo.findOne({ receipt_code: payload.sub }))) {
      throw UnknownUserError;
    }
    res.locals.jwtPayload = payload;
    next();
  } catch (e) {
    if (e instanceof TokenExpiredError || e instanceof JsonWebTokenError) {
      next(ExpiredOrInvalidTokenError);
    }
    next(e);
  }
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.get("Authorization");
    if (hasNullOrUndefined([token])) {
      throw ExpiredOrInvalidTokenError;
    }
    const payload: any = verify(token.substring(7), adminJwtSecret);
    if (payload.type !== "access") {
      throw ExpiredOrInvalidTokenError;
    }
    const connection = getConnection();
    const adminRepo = connection.getRepository(Admin);
    if (!(await adminRepo.findOne({ email: payload.identity }))) {
      throw UnknownUserError;
    }
    next();
  } catch (e) {
    if (e instanceof TokenExpiredError || e instanceof JsonWebTokenError) {
      next(ExpiredOrInvalidTokenError);
    }
    next(e);
  }
};
