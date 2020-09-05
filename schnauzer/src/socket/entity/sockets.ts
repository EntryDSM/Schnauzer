import { Socket } from "socket.io";
import { Event } from "./events";
import { User } from "../../entity/user";

export class Sockets {
  private userSockets: Socket[] = [];
  private adminSockets: Socket[] = [];

  public emitAllAdmin(event: Event, data): void {
    this.adminSockets.forEach((adminSocket) => {
      adminSocket.emit(event, data);
    });
  }

  public addAdmin(adminSocket: Socket): void {
    if (this.isNotExistAdmin(adminSocket)) {
      this.adminSockets.push(adminSocket);
      this.userSockets.forEach((userSocket) =>
        adminSocket.join(userSocket.request.user.email)
      );
    }
  }

  public async addUser(userSocket: Socket): Promise<void> {
    if (this.isNotExistUser(userSocket)) {
      const receiptCode = userSocket.request.user.sub;
      const { email } = await User.findByCode(receiptCode);
      userSocket.join(email);
      userSocket.request.user.email = email;
      this.userSockets.push(userSocket);
      this.adminSockets.forEach((adminSocket) =>
        adminSocket.join(userSocket.request.user.email)
      );
    }
  }

  public adminLeaveRooms(adminSocket: Socket): void {
    adminSocket.leaveAll();
    this.adminSockets = this.adminSockets.filter(
      (checkSocket) => checkSocket !== adminSocket
    );
  }

  public userLeaveRooms(userSocket: Socket): void {
    userSocket.leaveAll();
    this.userSockets = this.userSockets.filter(
      (checkSocket) => checkSocket !== userSocket
    );
  }

  private isNotExistUser(userSocket: Socket): boolean {
    return Boolean(!this.userSockets.find((socket) => socket === userSocket));
  }

  private isNotExistAdmin(adminSocket: Socket): boolean {
    return Boolean(!this.adminSockets.find((socket) => socket === adminSocket));
  }
}
