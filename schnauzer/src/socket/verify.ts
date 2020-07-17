import { User } from "../entity/user";
import { getConnection } from "typeorm";
import { Admin } from "../entity/admin";
import { UserType, STUDENT, ADMIN } from "../entity/qna";
import * as socketAuth from "socketio-jwt-auth";
import {
  UnknownUserError,
  ExpiredOrInvalidTokenError,
} from "../global/error/errorCode";

export const verifyFunc: socketAuth.verifyFunc = async (payload, done) => {
  try {
    if (payload.type === "refresh_token") {
      done(ExpiredOrInvalidTokenError);
    }
    const connection = getConnection();
    const userRepo = connection.getRepository(User);
    const adminRepo = connection.getRepository(Admin);
    const user = await userRepo.findOne({ email: payload.sub });
    const admin = await adminRepo.findOne({ email: payload.sub });
    let info;
    if (user) {
      info = user;
      info.userType = STUDENT;
    } else if (admin) {
      info = admin;
      info.userType = ADMIN;
    } else {
      return done(UnknownUserError);
    }
    return done(null, info);
  } catch (e) {
    return done(e);
  }
};
