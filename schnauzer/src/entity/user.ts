import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  getConnection,
} from "typeorm";
import { IsEmail, IsNotEmpty } from "class-validator";
import { ValidationEntity } from "./validationEntity";

@Entity()
export class User extends ValidationEntity {
  @Column({ length: 100, unique: true })
  @IsEmail()
  email: string;

  @Column({ length: 100, select: false })
  @IsNotEmpty()
  password: string;

  @PrimaryColumn({ type: "int" })
  @IsNotEmpty()
  receipt_code: number;

  @Column({ nullable: true, select: false, length: 20 })
  apply_type: string;

  @Column({ nullable: true, select: false, length: 20 })
  additional_type: string;

  @Column({ nullable: true, select: false, length: 20 })
  grade_type: string;

  @Column({ width: 1, nullable: true, select: false })
  is_daejeon: boolean;

  @Column({ length: 15, nullable: true })
  name: string;

  @Column({ nullable: true, select: false, length: 20 })
  sex: string;

  @Column({ type: "date", nullable: true, select: false })
  birth_date: Date;

  @Column({ length: 15, nullable: true, select: false })
  parent_name: string;

  @Column({ length: 20, nullable: true, select: false })
  parent_tel: string;

  @Column({ length: 20, nullable: true, select: false })
  applicant_tel: string;

  @Column({ length: 250, nullable: true, select: false })
  address: string;

  @Column({ length: 250, nullable: true, select: false })
  detail_address: string;

  @Column({ length: 5, nullable: true, select: false })
  post_code: string;

  @Column({ length: 45, nullable: true, select: false })
  user_photo: string;

  @Column({ length: 1600, nullable: true, select: false })
  self_introduction: string;

  @Column({ length: 1600, nullable: true, select: false })
  study_plan: string;

  @Column({ select: false, type: "datetime" })
  created_at: Date;

  @Column({ select: false, type: "datetime" })
  modified_at: Date;

  static findByEmail(email: string) {
    return getConnection().getRepository(User).findOne({ email });
  }
}
