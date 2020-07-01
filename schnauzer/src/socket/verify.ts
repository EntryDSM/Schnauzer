import { User } from "../entity/user";
import { getConnection } from "typeorm";
import { dbOptions } from "../config";
import { Admin } from "../entity/admin";
import { UserType } from "../entity/qna";

export const verifyFunc = async (payload, done) => {
  try {
    const connection = getConnection(dbOptions.CONNECTION_NAME);
    const userRepo = connection.getRepository(User);
    const adminRepo = connection.getRepository(Admin);
    const user = await userRepo.findOne({ email: payload.sub });
    const admin = await adminRepo.findOne({ email: payload.sub });
    let info;
    if (user) {
      info = user;
      info.userType = UserType.STUDENT;
    } else if (admin) {
      info = admin;
      info.userType = UserType.ADMIN;
    } else {
      return done(null, false, "user does not exist");
    }
    return done(null, info);
  } catch (e) {
    return done(e);
  }
};
