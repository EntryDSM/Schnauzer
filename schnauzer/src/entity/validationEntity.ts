import { BaseEntity, BeforeInsert, BeforeUpdate } from "typeorm";
import { validateOrReject } from "class-validator";
import { InvalidParameterError } from "../global/error/errorCode";

export abstract class ValidationEntity extends BaseEntity {
  @BeforeInsert()
  @BeforeUpdate()
  async validate(): Promise<void> {
    try {
      await validateOrReject(this);
    } catch (e) {
      throw InvalidParameterError;
    }
  }
}
