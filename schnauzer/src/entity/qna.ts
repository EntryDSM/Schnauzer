import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";
import { IsNotEmpty, IsEmail } from "class-validator";
import { ValidationEntity } from "./validationEntity";
import { Like } from "typeorm";
import { getConnection } from "typeorm";
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

  @Column()
  @IsNotEmpty()
  user_receipt_code: number;

  @Column({ length: 50 })
  @IsNotEmpty()
  to: string;

  @Column({ length: 100 })
  @IsNotEmpty()
  content: string;

  @Column()
  created_at: Date;

  @Column({
    type: "tinyint",
    width: 1,
  })
  is_read: boolean;

  static findByUserCodeWithPage(code: number, page: number, limit: number) {
    return getConnection()
      .createQueryBuilder()
      .select("qna")
      .from(Qna, "qna")
      .where("qna.user_receipt_code = :code", { code })
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
          .groupBy("user_receipt_code")
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
          .where("qna.user_receipt_code IN (:...codes)", {
            codes: searchResult.map((user) => user.receipt_code),
          })
          .groupBy("user_receipt_code")
          .getQuery();
        return "qna.qna_id IN " + subQuery;
      })
      .limit(limit)
      .offset(limit * page)
      .orderBy("qna_id", "DESC")
      .getMany();
  }

  static async updateIsReadByReceiptCode(code: number) {
    return getConnection()
      .createQueryBuilder()
      .update(Qna)
      .set({ is_read: true })
      .where("user_receipt_code = :code", { code })
      .execute();
  }

  static async createNewQna(qna: {
    user_receipt_code: number;
    admin_email: string;
    content: string;
    to: UserType;
    is_read?: boolean;
    created_at?: Date;
  }) {
    qna.is_read = false;
    qna.created_at = new Date(Date.now());
    const qnaRepo = getConnection().getRepository(Qna);
    return qnaRepo.save(qnaRepo.create(qna));
  }
}
