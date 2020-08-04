import { Server, Socket } from "socket.io";
import { Qna, UserType, ADMIN, STUDENT } from "../entity/qna";
import { Sockets } from "./entity/sockets";
import { Event } from "./entity/events";
import { DatabaseUpdateError } from "../global/error/errorCode";

const sockets = new Sockets();

export const socketInit = (socket: Socket, type: UserType, io: Server) => {
  if (type === ADMIN) {
    sockets.addAdmin(socket);

    socket.on(
      Event.NEW_MESSAGE,
      async ({
        receiptCode,
        content,
        userEmail,
      }: {
        receiptCode: number;
        content: string;
        userEmail: string;
      }) => {
        try {
          const storedChat = await Qna.createNewQna({
            user_receipt_code: receiptCode,
            content,
            admin_email: socket.request.user.email,
            to: STUDENT,
          });
          io.to(userEmail).emit(Event.RECEIVE_MESSAGE, storedChat);
        } catch (e) {
          socket.emit(Event.SAVE_ERROR, DatabaseUpdateError);
        }
      }
    );

    socket.on(
      Event.READ_CHECK,
      async ({
        userEmail,
        receiptCode,
      }: {
        userEmail: string;
        receiptCode: number;
      }) => {
        try {
          await Qna.updateIsReadByReceiptCode(receiptCode);
          io.to(userEmail).emit(Event.RECEIVE_READ_CHECK, userEmail);
        } catch (e) {
          socket.emit(Event.SAVE_ERROR, DatabaseUpdateError);
        }
      }
    );

    socket.on("disconnect", () => {
      sockets.adminLeaveRooms(socket);
    });
  } else if (type === STUDENT) {
    sockets.addUser(socket);

    socket.on(
      Event.NEW_MESSAGE,
      async ({
        content,
        receiptCode,
      }: {
        content: string;
        receiptCode: number;
      }) => {
        try {
          const userEmail = socket.request.user.email;
          const storedChat = await Qna.createNewQna({
            user_receipt_code: receiptCode,
            content,
            admin_email: "broadcast@broadcast.com",
            to: ADMIN,
          });
          io.to(userEmail).emit(Event.RECEIVE_MESSAGE, storedChat);
        } catch (e) {
          socket.emit(Event.SAVE_ERROR, DatabaseUpdateError);
        }
      }
    );

    socket.on("disconnect", () => {
      sockets.userLeaveRooms(socket);
    });
  }
};
