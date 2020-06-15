import { Request, Response, NextFunction } from "express";
import { getConnection } from "typeorm";
import { HttpError } from "../error";
import { Qna } from "../entity/qna";
import { User } from "../entity/user";
import { dbOptions } from "../config";
import { Admin } from "../entity/admin";

export class ChatController {
  static getChats = async (req: Request, res: Response, next: NextFunction) => {
    const userEmail = res.locals.jwtPayload.sub;
    const { page } = req.query;
    try {
      const connection = getConnection(dbOptions.CONNECTION_NAME);
      const userRepo = connection.getRepository(User);
      if (!(await userRepo.findOne({ email: userEmail }))) {
        throw new HttpError("어드민 불허", 400);
      }
      const chats = await Qna.findByUserEmailWithPage(userEmail, Number(page));
      res.status(200).json(chats);
    } catch (e) {
      next(e);
    }
  };

  static getChatsWithEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const adminEmail = res.locals.jwtPayload.sub;
    const userEmail = req.params.email;
    const { page } = req.query;
    try {
      const connection = getConnection(dbOptions.CONNECTION_NAME);
      const adminRepo = connection.getRepository(Admin);
      if (!(await adminRepo.findOne({ email: adminEmail }))) {
        throw new HttpError("일반 유저 불허", 400);
      }
      const chats = await Qna.findByUserEmailWithPage(userEmail, Number(page));
      res.status(200).json(chats);
    } catch (e) {
      next(e);
    }
  };
}
