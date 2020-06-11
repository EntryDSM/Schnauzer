import { Request, Response, NextFunction } from "express";
import { HttpError } from "../error";
import { Qna } from "../entity/qna";
import { User } from "../entity/user";

export class ChatController {
  static getChats = async (req: Request, res: Response, next: NextFunction) => {
    const { email }: { email: string } = res.locals.jwtPayload;
    const userRepo = User.getRepository();
    const qnaRepo = Qna.getRepository();
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
