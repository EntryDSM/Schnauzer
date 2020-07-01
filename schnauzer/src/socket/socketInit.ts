import { Server, Socket } from "socket.io";
import { UserType } from "../entity/qna";
import { User } from "../entity/user";
import { Qna } from "../entity/qna";
import { Sockets } from "./entity/sockets";
import { Event } from "./entity/events";

const sockets = new Sockets();

export const socketInit = (socket: Socket, type: UserType, io: Server) => {
  if (type === UserType.ADMIN) {
    sockets.addAdmin(socket);

    socket.on(
      Event.NEW_MESSAGE,
      (message: { userEmail: string; content: string }) => {
        const { userEmail, content } = message;
        const reply = {
          adminEmail: socket.request.user.email,
          userEmail,
          content,
          to: UserType.STUDENT,
        };
        io.to(message.userEmail).emit(Event.RECEIVE_MESSAGE, reply);
      }
    );

    socket.on(Event.READ_CHECK, (userEmail: string) => {
      io.to(userEmail).emit(Event.RECEIVE_READ_CHECK, userEmail);
    });

    socket.on("disconnect", () => {
      sockets.deleteAdminAndLeaveRooms(socket);
    });
  } else if (type === UserType.STUDENT) {
    sockets.addUser(socket);

    socket.on(Event.NEW_MESSAGE, (message: { content: string }) => {
      const userEmail = socket.request.user.email;
      const reply = {
        adminEmail: "broadcast@broadcast.com",
        userEmail,
        content: message.content,
        to: UserType.ADMIN,
      };
      io.to(userEmail).emit(Event.RECEIVE_MESSAGE, reply);
    });

    socket.on("disconnect", () => {
      sockets.deleteUserAndLeaveRooms(socket);
    });
  }
};
