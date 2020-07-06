import { Server, Socket } from "socket.io";
import { Qna, UserType } from "../entity/qna";
import { Sockets } from "./entity/sockets";
import { Event } from "./entity/events";

const sockets = new Sockets();

export const socketInit = (socket: Socket, type: UserType, io: Server) => {
  if (type === UserType.ADMIN) {
    sockets.addAdmin(socket);

    socket.on(
      Event.NEW_MESSAGE,
      async ({
        userEmail,
        content,
      }: {
        userEmail: string;
        content: string;
      }) => {
        try {
          const storedChat = await Qna.createNewQna({
            user_email: userEmail,
            content,
            admin_email: socket.request.user.email,
            to: UserType.STUDENT,
          });
          io.to(userEmail).emit(Event.RECEIVE_MESSAGE, storedChat);
        } catch (e) {
          socket.emit(Event.SAVE_ERROR, e);
        }
      }
    );

    socket.on(Event.READ_CHECK, async (userEmail: string) => {
      try {
        await Qna.updateIsReadByUserEmail(userEmail);
        io.to(userEmail).emit(Event.RECEIVE_READ_CHECK, userEmail);
      } catch (e) {
        socket.emit(Event.SAVE_ERROR, e);
      }
    });

    socket.on("disconnect", () => {
      sockets.adminLeaveRooms(socket);
    });
  } else if (type === UserType.STUDENT) {
    sockets.addUser(socket);

    socket.on(Event.NEW_MESSAGE, async ({ content }: { content: string }) => {
      try {
        const userEmail = socket.request.user.email;
        const storedChat = await Qna.createNewQna({
          user_email: userEmail,
          content,
          admin_email: "broadcast@broadcast.com",
          to: UserType.ADMIN,
        });
        io.to(userEmail).emit(Event.RECEIVE_MESSAGE, storedChat);
      } catch (e) {
        socket.emit(Event.SAVE_ERROR, e);
      }
    });

    socket.on("disconnect", () => {
      sockets.userLeaveRooms(socket);
    });
  }
};
