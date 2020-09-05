import { Server } from "socket.io";
import { adminJwtSecret, mainJwtSecret } from "../global/config";
import { socketInit } from "./socketInit";
import { getConnection } from "typeorm";
import { Admin } from "../entity/admin";
import * as jwt from "jsonwebtoken";
import { User } from "../entity/user";
import {
  ExpiredOrInvalidTokenError,
  UnknownUserError,
} from "../global/error/errorCode";
import * as socketIOAuth from "socketio-auth";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export default (io: Server) => {
  socketIOAuth(io, {
    authenticate: async (socket, data, callback) => {
      const { token, type } = data;
      try {
        const connection = getConnection();
        let user;

        if (type === "admin") {
          const payload: any = jwt.verify(token, adminJwtSecret);

          if (payload.type !== "access") {
            return callback(ExpiredOrInvalidTokenError);
          }

          const adminRepo = connection.getRepository(Admin);
          user = await adminRepo.findOne({ email: payload.identity });
        } else if (type === "student") {
          const payload: any = jwt.verify(token, mainJwtSecret);

          if (payload.type !== "access_token") {
            return callback(ExpiredOrInvalidTokenError);
          }

          const userRepo = connection.getRepository(User);
          user = await userRepo.findOne({ receipt_code: payload.sub });
        } else {
          return callback(UnknownUserError);
        }
        if (!user) {
          return callback(UnknownUserError);
        }
        callback(null, true);
      } catch (e) {
        if (e instanceof JsonWebTokenError || e instanceof TokenExpiredError) {
          callback(ExpiredOrInvalidTokenError);
        }
        callback(e);
      }
    },
    postAuthenticate: async (socket, data) => {
      const { token, type } = data;
      try {
        let payload;
        if (type === "admin") {
          payload = jwt.verify(token, adminJwtSecret);
          socket.request.user = payload;
          socket.request.user.userType = "admin";
        } else if (type === "student") {
          payload = jwt.verify(token, mainJwtSecret);
          socket.request.user = payload;
          socket.request.user.userType = "student";
        }
        await socketInit(socket, socket.request.user.userType, io);
      } catch (e) {
        socket.emit("unauthorized", ExpiredOrInvalidTokenError);
      }
    },
    timeout: 2000,
  });
};
