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
      const connection = getConnection(dbOptions.CONNECTION_NAME);
      const qnaRepo = connection.getRepository(Qna);
      const storedChat = await qnaRepo.save(
        qnaRepo.create({
          user_email: userEmail,
          admin_email: "broadcast@broadcast.com",
          content,
          to: UserType.ADMIN,
        })
      );
      res.status(200).json(storedChat);
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
      const connection = getConnection(dbOptions.CONNECTION_NAME);
      const qnaRepo = connection.getRepository(Qna);
      const storedChat = await qnaRepo.save(
        qnaRepo.create({
          user_email: userEmail,
          admin_email: adminEmail,
          content,
          to: UserType.STUDENT,
        })
      );
      res.status(200).json(storedChat);
    } catch (e) {
      next(e);
    }
  };

  static patchIsRead = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { userEmail } = req.body;
    try {
      await getConnection(dbOptions.CONNECTION_NAME)
        .createQueryBuilder()
        .update(Qna)
        .set({ is_read: true })
        .where("user_email = :userEmail", { userEmail })
        .execute();
      res.status(200).json();
    } catch (e) {
      next(e);
    }
  };
}
