import { Entity, Column, PrimaryColumn, CreateDateColumn } from "typeorm";
import { IsEmail, IsNotEmpty } from "class-validator";
import { ValidationEntity } from "./validationEntity";

@Entity()
export class Admin extends ValidationEntity {
  @PrimaryColumn({ length: 100 })
  @IsEmail()
  email: string;

  @Column({ length: 100, select: false })
  @IsNotEmpty()
  password: string;

  @Column({ length: 45 })
  @IsNotEmpty()
  name: string;
}
