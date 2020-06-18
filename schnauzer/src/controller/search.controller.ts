import { NextFunction, Request, Response } from "express";
import { getConnection } from "typeorm";
import { dbOptions } from "../config";
import { Admin } from "../entity/admin";
import { HttpError } from "../error";
import { Qna } from "../entity/qna";
import { User } from "../entity/user";

export class SearchController {
  static searchByName = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { name } = req.params;
    const adminEmail = res.locals.jwtPayload.sub;
    try {
      const connection = getConnection(dbOptions.CONNECTION_NAME);
      const adminRepo = connection.getRepository(Admin);
      const userRepo = connection.getRepository(User);
      if (!(await adminRepo.findOne({ email: adminEmail }))) {
        throw new HttpError("알 수 없는 사용자", 400);
      }
      const searchResult = await Qna.findLastChatOfEachUserByName(name);
      const lastChats = await Promise.all(
        searchResult.map(async (chat) => {
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
