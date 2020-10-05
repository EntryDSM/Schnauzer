import { Server, Socket } from "socket.io";
import { ADMIN, Qna, STUDENT, UserType } from "../entity/qna";
import { Sockets } from "./entity/sockets";
import { Event } from "./entity/events";
import { DatabaseUpdateError } from "../global/error/errorCode";
import { User } from "../entity/user";
import logger from "../global/utils/logger";

const sockets = new Sockets();

export const socketInit = async (
  socket: Socket,
  type: UserType,
  io: Server
) => {
  if (type === ADMIN) {
    sockets.addAdmin(socket);

    socket.on(
      Event.NEW_MESSAGE,
      async ({
        content,
        userEmail,
      }: {
        content: string;
        userEmail: string;
      }) => {
        try {
          const { receipt_code } = await User.findByEmail(userEmail);
          const storedChat = await Qna.createNewQna({
            user_receipt_code: receipt_code,
            content,
            to: STUDENT,
          });
          let check = false;
          for (const room in socket.rooms) {
            if (room === userEmail) {
              check = true;
              break;
            }
          }
          if (check) {
            io.to(userEmail).emit(Event.RECEIVE_MESSAGE, storedChat);
          } else {
            sockets.emitAllAdmin(Event.RECEIVE_MESSAGE, storedChat);
          }
        } catch (e) {
          logger.error(`SOCKET ${e.message}`);
          socket.emit(Event.SAVE_ERROR, DatabaseUpdateError);
        }
      }
    );

    socket.on(
      Event.READ_CHECK,
      async ({ userEmail }: { userEmail: string }) => {
        try {
          const { receipt_code } = await User.findByEmail(userEmail);
          await Qna.updateIsReadByReceiptCode(receipt_code);
          let check = false;
          for (const room in socket.rooms) {
            if (room === userEmail) {
              check = true;
              break;
            }
          }
          if (check) {
            io.to(userEmail).emit(Event.RECEIVE_READ_CHECK, userEmail);
          } else {
            sockets.emitAllAdmin(Event.RECEIVE_READ_CHECK, userEmail);
          }
        } catch (e) {
          logger.error(`SOCKET ${e.message}`);
          socket.emit(Event.SAVE_ERROR, DatabaseUpdateError);
        }
      }
    );

    socket.on("disconnect", () => {
      sockets.adminLeaveRooms(socket);
    });
  } else if (type === STUDENT) {
    await sockets.addUser(socket);

    socket.on(Event.NEW_MESSAGE, async ({ content }: { content: string }) => {
      try {
        const { sub, email } = socket.request.user;
        const storedChat = await Qna.createNewQna({
          user_receipt_code: sub,
          content,
          to: ADMIN,
        });
        io.to(email).emit(Event.RECEIVE_MESSAGE, storedChat);
      } catch (e) {
        logger.error(`SOCKET ${e.message}`);
        socket.emit(Event.SAVE_ERROR, DatabaseUpdateError);
      }
    });

    socket.on("disconnect", () => {
      sockets.userLeaveRooms(socket);
    });
  }
};
