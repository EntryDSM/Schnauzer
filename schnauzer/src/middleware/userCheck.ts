import { NextFunction, Request, Response } from "express";
import { User } from "../entity/user";
import { getConnection } from "typeorm";
import { dbOptions } from "../config";
import { HttpError } from "../error";
import { Admin } from "../entity/admin";

export const isUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userEmail = res.locals.jwtPayload.sub;
  try {
    const connection = getConnection(dbOptions.CONNECTION_NAME);
    const userRepo = connection.getRepository(User);
    if (!(await userRepo.findOne({ email: userEmail }))) {
      throw new HttpError("알 수 없는 사용자", 400);
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
    const connection = getConnection(dbOptions.CONNECTION_NAME);
    const adminRepo = connection.getRepository(Admin);
    if (!(await adminRepo.findOne({ email: adminEmail }))) {
      throw new HttpError("알 수 없는 사용자", 400);
    }
    next();
  } catch (e) {
    next(e);
  }
};
