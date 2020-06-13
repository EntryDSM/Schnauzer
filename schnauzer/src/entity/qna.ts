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

  static findByUserEmailWithPage(email: string, page: number) {
    return getConnection(dbOptions.CONNECTION_NAME)
      .createQueryBuilder(Qna, "qna")
      .where("qna.user_email = :email", { email })
      .offset(page * 10)
      .limit(10)
      .getMany();
  }
}
