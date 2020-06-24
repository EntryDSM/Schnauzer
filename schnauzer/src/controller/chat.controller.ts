import { NextFunction, Request, Response } from "express";
import { getConnection } from "typeorm";
import { Qna, UserType } from "../entity/qna";
import { User } from "../entity/user";
import { dbOptions } from "../config";

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
    try {
      const connection = getConnection(dbOptions.CONNECTION_NAME);
      const userRepo = connection.getRepository(User);
      let chats = await Qna.findLastChatOfEachUser();
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

  static postChatUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { content } = req.body;
    const userEmail = res.locals.jwtPayload.sub;
    try {
      const qnaRepo = getConnection(dbOptions.CONNECTION_NAME).getRepository(
        Qna
      );
      const qna = Qna.create({
        user_email: userEmail,
        admin_email: "broadcast@broadcast",
        content,
        to: UserType.ADMIN,
      });
      await qnaRepo.save(qna);
      res.status(200).json();
    } catch (e) {
      next(e);
    }
  };

  static postChatAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { content, userEmail } = req.body;
    const adminEmail = res.locals.jwtPayload.sub;
    try {
      const qnaRepo = getConnection(dbOptions.CONNECTION_NAME).getRepository(
        Qna
      );
      const qna = Qna.create({
        user_email: userEmail,
        admin_email: adminEmail,
        content,
        to: UserType.STUDENT,
      });
      await qnaRepo.save(qna);
      res.status(200).json();
    } catch (e) {
      next(e);
    }
  };
}
