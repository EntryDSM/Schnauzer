import { NextFunction, Request, Response } from "express";
import { getConnection } from "typeorm";
import { Qna } from "../entity/qna";
import { User } from "../entity/user";
import hasNullOrUndefined from "../global/utils/paramsCheck";
import { InvalidParameterError } from "../global/error/errorCode";
import logger from "../global/utils/logger";

export class SearchController {
  static searchByName = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { name } = req.params;
    const { offset } = req.query;
    hasNullOrUndefined([name, offset]) && next(InvalidParameterError);
    try {
      const connection = getConnection();
      const userRepo = connection.getRepository(User);
      const searchResult = await Qna.findLastChatOfEachUserByName(
        name,
        Number(offset),
        15
      );
      const lastChats = await Promise.all(
        searchResult.map(async (chat) => {
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
