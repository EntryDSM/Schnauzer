import { Request, Response, NextFunction } from "express";
import { getConnection } from "typeorm";
import { HttpError } from "../error";
import { Qna } from "../entity/qna";
import { User } from "../entity/user";
import { dbOptions } from "../config";

export class ChatController {
  static getChats = async (req: Request, res: Response, next: NextFunction) => {
    const { sub }: { sub: string } = res.locals.jwtPayload;
    const { page } = req.query;
    const connection = getConnection(dbOptions.CONNECTION_NAME);
    const userRepo = connection.getRepository(User);
    try {
      if (await userRepo.findOne({ email: sub })) {
        const chats = await Qna.findByUserEmailWithPage(sub, Number(page));
        res.status(200).json(chats);
      } else {
        throw new HttpError("어드민 불허", 400);
      }
    } catch (e) {
      next(e);
    }
  };
}
