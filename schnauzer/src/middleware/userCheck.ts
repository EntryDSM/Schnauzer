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
    if (hasNullOrUndefined([req.get("Authorization")])) {
      throw ExpiredOrInvalidTokenError;
    }
    const payload: any = verify(
      req.get("Authorization").substring(7),
      mainJwtSecret
    );
    if (payload.type !== "access_token") {
      throw ExpiredOrInvalidTokenError;
    }
    const connection = getConnection();
    const userRepo = connection.getRepository(User);
    if (!(await userRepo.findOne({ email: payload.email }))) {
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
    const payload: any = verify(
      req.get("Authorization").substring(7),
      adminJwtSecret
    );
    if (payload.type !== "access_token") {
      throw ExpiredOrInvalidTokenError;
    }
    const connection = getConnection();
    const adminRepo = connection.getRepository(Admin);
    if (!(await adminRepo.findOne({ email: payload.email }))) {
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
