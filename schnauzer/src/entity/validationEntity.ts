import { BaseEntity, BeforeInsert, BeforeUpdate } from "typeorm";
import { validateOrReject } from "class-validator";
import { HttpError } from "../error";

export abstract class ValidationEntity extends BaseEntity {
  @BeforeInsert()
  @BeforeUpdate()
  async validate(): Promise<void> {
    try {
      await validateOrReject(this);
    } catch (e) {
      throw new HttpError("파라미터 부정확", 400);
    }
  }
}
