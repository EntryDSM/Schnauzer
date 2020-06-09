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

  @Column({ length: 100 })
  @IsNotEmpty()
  password: string;

  @Column({ type: "int" })
  @IsNotEmpty()
  receipt_number: number;

  @Column({ type: "enum", enum: ApplyType, nullable: true })
  apply_type: ApplyType;

  @Column({ type: "enum", enum: AdditionalType, nullable: true })
  additional_type: AdditionalType;

  @Column({ type: "enum", enum: GradeType, nullable: true })
  grade_type: GradeType;

  @Column({ width: 2, nullable: true })
  is_daejeon: boolean;

  @Column({ length: 15, nullable: true })
  name: string;

  @Column({ type: "enum", enum: Sex, nullable: true })
  sex: Sex;

  @Column({ type: "date", nullable: true })
  birth_date: Date;

  @Column({ length: 15, nullable: true })
  parent_name: string;

  @Column({ length: 20, nullable: true })
  parent_tel: string;

  @Column({ length: 20, nullable: true })
  applicant_tel: string;

  @Column({ length: 500, nullable: true })
  address: string;

  @Column({ length: 5, nullable: true })
  post_code: string;

  @Column({ length: 45, nullable: true })
  user_photo: string;

  @Column({ length: 45, nullable: true })
  home_tel: string;

  @Column({ length: 1600, nullable: true })
  self_introduction: string;

  @Column({ length: 1600, nullable: true })
  study_plan: string;

  @CreateDateColumn()
  created_at: Date;
}
