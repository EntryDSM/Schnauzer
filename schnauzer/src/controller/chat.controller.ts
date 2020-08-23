import { NextFunction, Request, Response } from "express";
import { getConnection } from "typeorm";
import { Qna } from "../entity/qna";
import { User } from "../entity/user";
import { InvalidParameterError } from "../global/error/errorCode";
import hasNullOrUndefined from "../global/utils/paramsCheck";
import logger from "../global/utils/logger";

export class ChatController {
  static getChats = async (req: Request, res: Response, next: NextFunction) => {
    const { sub } = res.locals.jwtPayload;
    const { offset } = req.query;
    hasNullOrUndefined([sub, offset]) && next(InvalidParameterError);
    const limit = 10;
    try {
      const chats = (
        await Qna.findByUserEmailWithPage(sub, Number(offset), limit)
      ).reverse();
      logger.info(`${req.method} ${req.url} 200`);
      res.status(200).json(chats);
    } catch (e) {
      next(e);
    }
  };

  static getChatsWithCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { receiptCode } = req.params;
    const { offset } = req.query;
    const limit = 10;
    hasNullOrUndefined([receiptCode, offset]) && next(InvalidParameterError);
    try {
      const chats = (
        await Qna.findByUserCodeWithPage(
          Number(receiptCode),
          Number(offset),
          limit
        )
      ).reverse();
      logger.info(`${req.method} ${req.url} 200`);
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
    const { offset } = req.query;
    hasNullOrUndefined([offset]) && next(InvalidParameterError);
    try {
      const connection = getConnection();
      const userRepo = connection.getRepository(User);
      let chats = await Qna.findLastChatOfEachUser(Number(offset), 15);
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
      logger.info(`${req.method} ${req.url} 200`);
      res.status(200).json(lastChats);
    } catch (e) {
      next(e);
    }
  };
}
