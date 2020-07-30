import { NextFunction, Request, Response } from "express";
import { getConnection } from "typeorm";
import { Qna, UserType } from "../entity/qna";
import { User } from "../entity/user";

export class ChatController {
  static getChats = async (req: Request, res: Response, next: NextFunction) => {
    const { page, receiptCode } = req.query;
    const limit = 10;
    try {
      const chats = await Qna.findByUserCodeWithPage(
        Number(receiptCode),
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
    const { receiptCode } = req.params;
    const { page } = req.query;
    const limit = 10;
    try {
      const chats = await Qna.findByUserCodeWithPage(
        Number(receiptCode),
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
          const user = await userRepo.findOne({
            receipt_code: chat.user_receipt_code,
          });
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
