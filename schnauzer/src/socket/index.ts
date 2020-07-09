import { Server } from "socket.io";
import { authenticate } from "socketio-jwt-auth";
import { jwtSecret } from "../global/config";
import { verifyFunc } from "./verify";
import { socketInit } from "./socketInit";

export default (io: Server) => {
  io.use(
    authenticate(
      {
        secret: jwtSecret,
        succeedWithoutToken: false,
      },
      verifyFunc
    )
  );

  io.on("connection", (socket) => {
    socketInit(socket, socket.request.user.userType, io);
  });
};
