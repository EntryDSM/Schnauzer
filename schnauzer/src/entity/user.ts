import { Entity, Column, PrimaryColumn, CreateDateColumn } from "typeorm";
import { IsEmail, IsNotEmpty } from "class-validator";
import { ValidationEntity } from "./validationEntity";

export enum ApplyType {
  COMMON = "COMMON",
  MEISTER = "MEISTER",
  SOCIAL_ONE_PARENT = "SOCIAL_ONE_PARENT",
  SOCIAL_FROM_NORTH = "SOCIAL_FROM_NORTH",
  SOCIAL_MULTICULTURAL = "SOCIAL_MULTICULTURAL",
  SOCIAL_BASIC_LIVING = "SOCIAL_BASIC_LIVING",
  SOCIAL_LOWEST_INCOME = "SOCIAL_LOWEST_INCOME",
  SOCIAL_TEEN_HOUSEHOLDER = "SOCIAL_TEEN_HOUSEHOLDER",
}

export enum AdditionalType {
  NATIONAL_MERIT = "NATIONAL_MERIT",
  PRIVILEGED_ADMISSION = "PRIVILEGED_ADMISSION",
  NOT_APPLICABLE = "NOT_APPLICABLE",
}

export enum GradeType {
  GED = "GED",
  UNGRADUATED = "UNGRADUATED",
  GRADUATED = "GRADUATED",
}

export enum Sex {
  FEMALE = "FEMALE",
  MALE = "MALE",
}

@Entity()
export class User extends ValidationEntity {
  @PrimaryColumn({ length: 100 })
  @IsEmail()
  email: string;

  @Column({ length: 100, select: false })
  @IsNotEmpty()
  password: string;

  @Column({ type: "int" })
  @IsNotEmpty()
  receipt_code: number;

  @Column({ type: "enum", enum: ApplyType, nullable: true, select: false })
  apply_type: ApplyType;

  @Column({ type: "enum", enum: AdditionalType, nullable: true, select: false })
  additional_type: AdditionalType;

  @Column({ type: "enum", enum: GradeType, nullable: true, select: false })
  grade_type: GradeType;

  @Column({ width: 2, nullable: true, select: false })
  is_daejeon: boolean;

  @Column({ length: 15, nullable: true })
  name: string;

  @Column({ type: "enum", enum: Sex, nullable: true, select: false })
  sex: Sex;

  @Column({ type: "date", nullable: true, select: false })
  birth_date: Date;

  @Column({ length: 15, nullable: true, select: false })
  parent_name: string;

  @Column({ length: 20, nullable: true, select: false })
  parent_tel: string;

  @Column({ length: 20, nullable: true, select: false })
  applicant_tel: string;

  @Column({ length: 500, nullable: true, select: false })
  address: string;

  @Column({ length: 5, nullable: true, select: false })
  post_code: string;

  @Column({ length: 45, nullable: true, select: false })
  user_photo: string;

  @Column({ length: 45, nullable: true, select: false })
  home_tel: string;

  @Column({ length: 1600, nullable: true, select: false })
  self_introduction: string;

  @Column({ length: 1600, nullable: true, select: false })
  study_plan: string;

  @CreateDateColumn({ select: false })
  created_at: Date;
}
