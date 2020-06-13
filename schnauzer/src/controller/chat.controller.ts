import { Request, Response, NextFunction } from "express";
import { createConnection, getConnection } from "typeorm";
import { HttpError } from "../error";
import { Qna } from "../entity/qna";
import { User } from "../entity/user";
import { dbOptions } from "../config";

export class ChatController {
  static getChats = async (req: Request, res: Response, next: NextFunction) => {
    const connection = getConnection(dbOptions.CONNECTION_NAME);
    const { email }: { email: string } = res.locals.jwtPayload;
    const userRepo = connection.getRepository(User);
    const qnaRepo = connection.getRepository(Qna);
    try {
      if (await userRepo.findOne({ email })) {
        const chats = await qnaRepo.find({ where: { user_email: email } });
        res.status(200).json(chats);
      } else {
        throw new HttpError("어드민 불허", 400);
      }
    } catch (e) {
      next(e);
    }
  };
}
