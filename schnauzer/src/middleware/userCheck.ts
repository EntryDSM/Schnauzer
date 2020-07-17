import { NextFunction, Request, Response } from "express";
import { User } from "../entity/user";
import { getConnection } from "typeorm";
import { UnknownUserError } from "../global/error/errorCode";
import { Admin } from "../entity/admin";

export const isUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userEmail = res.locals.jwtPayload.sub;
  try {
    const connection = getConnection();
    const userRepo = connection.getRepository(User);
    if (!(await userRepo.findOne({ email: userEmail }))) {
      throw UnknownUserError;
    }
    next();
  } catch (e) {
    next(e);
  }
};

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const adminEmail = res.locals.jwtPayload.sub;
  try {
    const connection = getConnection();
    const adminRepo = connection.getRepository(Admin);
    if (!(await adminRepo.findOne({ email: adminEmail }))) {
      throw UnknownUserError;
    }
    next();
  } catch (e) {
    next(e);
  }
};
