import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";
import { IsNotEmpty, IsEmail } from "class-validator";
import { ValidationEntity } from "./validationEntity";
import { Like } from "typeorm";
import { getConnection } from "./connection";
import { dbOptions } from "../global/config";
import { User } from "./user";

export type UserType = "admin" | "student";
export const ADMIN = "admin";
export const STUDENT = "student";

@Entity()
export class Qna extends ValidationEntity {
  @PrimaryGeneratedColumn()
  qna_id: number;

  @Column({ length: 100 })
  @IsNotEmpty()
  @IsEmail()
  admin_email: string;

  @Column({ length: 100 })
  @IsNotEmpty()
  @IsEmail()
  user_email: string;

  @Column({ length: 20 })
  @IsNotEmpty()
  to: string;

  @Column({ length: 100 })
  @IsNotEmpty()
  content: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column({
    type: "tinyint",
    width: 2,
    default: 0,
    insert: false,
  })
  is_read: boolean;

  static findByUserEmailWithPage(email: string, page: number, limit: number) {
    return getConnection()
      .createQueryBuilder()
      .select("qna")
      .from(Qna, "qna")
      .where("qna.user_email = :email", { email })
      .orderBy("created_at", "DESC")
      .offset(page * limit)
      .limit(limit)
      .getMany();
  }

  static findLastChatOfEachUser(page: number, limit: number) {
    return getConnection()
      .createQueryBuilder()
      .select("qna")
      .from(Qna, "qna")
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select("MAX(qna.qna_id)")
          .from(Qna, "qna")
          .groupBy("user_email")
          .getQuery();
        return "qna.qna_id IN " + subQuery;
      })
      .limit(limit)
      .offset(page * limit)
      .orderBy("qna_id", "DESC")
      .getMany();
  }

  static async findLastChatOfEachUserByName(
    name: string,
    page: number,
    limit: number
  ) {
    const searchResult = await getConnection()
      .getRepository(User)
      .find({ name: Like(`%${name}%`) });

    if (!searchResult.length) {
      return [];
    }

    return getConnection()
      .createQueryBuilder()
      .select("qna")
      .from(Qna, "qna")
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select("MAX(qna.qna_id)")
          .from(Qna, "qna")
          .where("qna.user_email IN (:...emails)", {
            emails: searchResult.map((user) => user.email),
          })
          .groupBy("user_email")
          .getQuery();
        return "qna.qna_id IN " + subQuery;
      })
      .limit(limit)
      .offset(limit * page)
      .orderBy("qna_id", "DESC")
      .getMany();
  }

  static async updateIsReadByUserEmail(userEmail: string) {
    return getConnection()
      .createQueryBuilder()
      .update(Qna)
      .set({ is_read: true })
      .where("user_email = :userEmail", { userEmail })
      .execute();
  }

  static async createNewQna(qna: {
    user_email: string;
    admin_email: string;
    content: string;
    to: UserType;
  }) {
    const qnaRepo = getConnection().getRepository(Qna);
    return qnaRepo.save(qnaRepo.create(qna));
  }
}
