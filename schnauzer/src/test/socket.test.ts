import * as io from "socket.io-client";
import * as http from "http";
import * as ioBack from "socket.io";
import * as chai from "chai";
import Socket = SocketIOClient.Socket;
import { Server } from "http";
import { Socket as ServerSocket, Server as IoServer } from "socket.io";
import { adminJwtSecret, mainJwtSecret } from "../global/config";
import { sign } from "jsonwebtoken";
import socketInit from "../socket/index";
import { Event } from "../socket/entity/events";
import { Connection, getConnection, Repository } from "typeorm";
import { Qna } from "../entity/qna";
import { User } from "../entity/user";
import { Admin } from "../entity/admin";
import * as jwt from "jsonwebtoken";

chai.should();

let userSocket: Socket, adminSocket: Socket, otherAdminSocket: Socket;
let httpServer: Server;
let httpServerAddr;
let ioServer: IoServer, socket: ServerSocket;
let userToken: string, adminToken: string, otherAdminToken: string;
let connection: Connection;

before((done) => {
  connection = getConnection();
  userToken = generateToken("access_token", mainJwtSecret, "user3@example.com");
  adminToken = generateToken(
    "access_token",
    adminJwtSecret,
    "admin1@example.com"
  );
  otherAdminToken = generateToken(
    "access_token",
    adminJwtSecret,
    "admin2@example.com"
  );

  httpServer = http.createServer().listen();
  httpServerAddr = httpServer.address();
  ioServer = ioBack(httpServer);
  socketInit(ioServer);
  done();
});

after((done) => {
  ioServer.close(() => {
    httpServer.close(() => {
      disconnectSocket(userSocket);
      disconnectSocket(adminSocket);
      disconnectSocket(otherAdminSocket);
      const qnaRepo: Repository<Qna> = connection.getRepository(Qna);
      const userRepo: Repository<User> = connection.getRepository(User);
      const adminRepo: Repository<Admin> = connection.getRepository(Admin);
      qnaRepo
        .clear()
        .then(() =>
          Promise.all([userRepo.clear(), adminRepo.clear()]).then(() => done())
        );
    });
  });
});

describe("basic socket.io example", function () {
  describe("user", () => {
    before((done) => {
      userSocket = connectSocketClient(userToken, httpServerAddr);
      userSocket.on("authenticated", () => done());
      userSocket.on("unauthorized", (err) => console.log(err));
      userSocket.emit("authentication", { token: userToken, type: "student" });
    });

    after((done) => {
      disconnectSocket(userSocket);
      done();
    });

    it("should communicate", (done) => {
      userSocket.emit(Event.NEW_MESSAGE, {
        content: "안녕",
      });
      userSocket.on(Event.RECEIVE_MESSAGE, (message) => {
        delete message.created_at;
        message.should.be.an.instanceOf(Object);
        message.should.deep.equal({
          qna_id: 15,
          admin_email: null,
          user_receipt_code: 30003,
          content: "안녕",
          to: "admin",
          is_read: false,
        });
        done();
      });
    });
  });
  describe("admin", () => {
    beforeEach((done) => {
      let admin = false,
        user = false,
        otherAdmin = false;
      adminSocket = connectSocketClient(adminToken, httpServerAddr);
      adminSocket.emit("authentication", { token: adminToken, type: "admin" });
      userSocket = connectSocketClient(userToken, httpServerAddr);
      userSocket.emit("authentication", { token: userToken, type: "student" });
      otherAdminSocket = connectSocketClient(otherAdminToken, httpServerAddr);
      otherAdminSocket.emit("authentication", {
        token: otherAdminToken,
        type: "admin",
      });
      userSocket.on("authenticated", () => {
        user = true;
        if (admin && user && otherAdmin) done();
      });
      adminSocket.on("authenticated", () => {
        admin = true;
        if (admin && user && otherAdmin) done();
      });
      otherAdminSocket.on("authenticated", () => {
        otherAdmin = true;
        if (admin && user && otherAdmin) done();
      });
    });

    afterEach((done) => {
      disconnectSocket(adminSocket);
      disconnectSocket(userSocket);
      disconnectSocket(otherAdminSocket);
      done();
    });

    describe("success", () => {
      it("should communicate", (done) => {
        adminSocket.emit(Event.NEW_MESSAGE, {
          content: "Hello",
          userEmail: "user3@example.com",
        });
        adminSocket.on(Event.RECEIVE_MESSAGE, (message) => {
          delete message.created_at;
          message.should.deep.equal({
            qna_id: 16,
            admin_email: "admin1@example.com",
            user_receipt_code: 30003,
            content: "Hello",
            to: "student",
            is_read: false,
          });
          done();
        });
      });
      it("should update is_read column", (done) => {
        adminSocket.emit(Event.READ_CHECK, {
          userEmail: "user3@example.com",
        });
        otherAdminSocket.on(Event.RECEIVE_READ_CHECK, (userEmail: string) => {
          done();
        });
      });
    });
    describe("fail", () => {
      it("should return save error", (done) => {
        userSocket.emit(Event.NEW_MESSAGE, { content: "" });
        userSocket.on(Event.SAVE_ERROR, (err) => {
          done();
        });
      });
      it("should return auth error", (done) => {
        const newSocket = connectSocketClient("fjweof", httpServerAddr);
        newSocket.emit("authentication", { token: "fjweof", type: "admin" });
        newSocket.on("unauthorized", (err) => {
          console.log(err);
          newSocket.disconnect();
          done();
        });
      });
      it("should return error with refresh token", (done) => {
        const refreshToken = generateToken(
          "refresh_token",
          mainJwtSecret,
          "user3@example.com"
        );
        const newSocket = connectSocketClient(refreshToken, httpServerAddr);
        newSocket.emit("authentication", {
          token: refreshToken,
          type: "student",
        });
        newSocket.on("unauthorized", (err) => {
          console.log(err);
          newSocket.disconnect();
          done();
        });
      });
    });
  });
});

function connectSocketClient(
  token: string,
  httpServerAddr: { port: number; family: string; address: string }
) {
  return io.connect(
    `http://[${httpServerAddr.address}]:${httpServerAddr.port}`,
    {
      reconnectionDelay: 0,
      forceNew: true,
      transports: ["websocket"],
    }
  );
}

function disconnectSocket(socket: Socket) {
  if (socket.connected) {
    socket.disconnect();
  }
}

function generateToken(type: string, secret: string, subject: string) {
  return jwt.sign({ type, email: subject }, secret, { expiresIn: "3m" });
}
