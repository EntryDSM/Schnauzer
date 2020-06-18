import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";
import { IsNotEmpty, IsEmail } from "class-validator";
import { ValidationEntity } from "./validationEntity";
import { getConnection } from "typeorm";
import { dbOptions } from "../config";
import { User } from "./user";

export enum UserType {
  ADMIN = "admin",
  STUDENT = "student",
}

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

  @Column({
    type: "enum",
    enum: UserType,
  })
  @IsNotEmpty()
  to: UserType;

  @Column({ length: 100 })
  @IsNotEmpty()
  content: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  static findByUserEmailWithPage(email: string, page: number, limit: number) {
    return getConnection(dbOptions.CONNECTION_NAME)
      .createQueryBuilder()
      .select("qna")
      .from(Qna, "qna")
      .where("qna.user_email = :email", { email })
      .orderBy("created_at", "DESC")
      .offset(page * limit)
      .limit(limit)
      .getMany();
  }

  static findLastChatOfEachUser() {
    return getConnection(dbOptions.CONNECTION_NAME)
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
      .orderBy("qna_id", "DESC")
      .getMany();
  }
}
