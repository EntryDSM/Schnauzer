import { NextFunction, Request, Response } from "express";
import { getConnection } from "../entity/connection";
import { Qna, UserType } from "../entity/qna";
import { User } from "../entity/user";

export class ChatController {
  static getChats = async (req: Request, res: Response, next: NextFunction) => {
    const userEmail = res.locals.jwtPayload.sub;
    const { page } = req.query;
    const limit = 10;
    try {
      const chats = await Qna.findByUserEmailWithPage(
        userEmail,
        Number(page),
        limit
      );
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
    const userEmail = req.params.email;
    const { page } = req.query;
    const limit = 10;
    try {
      const chats = await Qna.findByUserEmailWithPage(
        userEmail,
        Number(page),
        limit
      );
      res.status(200).json(chats);
    } catch (e) {
      next(e);
    }
  };

  static getLastChats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { page } = req.query;
    try {
      const connection = getConnection();
      const userRepo = connection.getRepository(User);
      let chats = await Qna.findLastChatOfEachUser(Number(page), 15);
      const lastChats = await Promise.all(
        chats.map(async (chat) => {
          const user = await userRepo.findOne({ email: chat.user_email });
          return {
            ...chat,
            user,
          };
        })
      );
      res.status(200).json(lastChats);
    } catch (e) {
      next(e);
    }
  };
}
