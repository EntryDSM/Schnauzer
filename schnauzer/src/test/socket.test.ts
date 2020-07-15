import * as io from "socket.io-client";
import * as http from "http";
import * as ioBack from "socket.io";
import * as chai from "chai";
import Socket = SocketIOClient.Socket;
import { Server } from "http";
import { Socket as ServerSocket, Server as IoServer } from "socket.io";
import { authenticate } from "socketio-jwt-auth";
import { jwtSecret } from "../global/config";
import { verifyFunc } from "../socket/verify";
import { sign } from "jsonwebtoken";
import socketInit from "../socket/index";
import { Event } from "../socket/entity/events";

chai.should();

let userSocket: Socket, adminSocket: Socket, otherAdminSocket: Socket;
let httpServer: Server;
let httpServerAddr;
let ioServer: IoServer, socket: ServerSocket;
let userToken: string, adminToken: string, otherAdminToken: string;

before((done) => {
  userToken = generateToken("user3@example.com");
  adminToken = generateToken("admin1@example.com");
  otherAdminToken = generateToken("admin2@example.com");

  httpServer = http.createServer().listen();
  httpServerAddr = httpServer.address();
  ioServer = ioBack().listen(5000);
  ioServer.bind(httpServer);
  socketInit(ioServer);
  done();
});

after((done) => {
  ioServer.close(() => {
    httpServer.close(() => {
      disconnectSocket(userSocket);
      disconnectSocket(adminSocket);
      disconnectSocket(otherAdminSocket);
      done();
    });
  });
});

describe("basic socket.io example", function () {
  describe("user", () => {
    before((done) => {
      userSocket = connectSocketClient(userToken, httpServerAddr);
      done();
    });

    afterEach((done) => {
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
          admin_email: "broadcast@broadcast.com",
          user_email: "user3@example.com",
          content: "안녕",
          to: "admin",
          is_read: 0,
        });
        done();
      });
    });
  });
  describe("admin", () => {
    before((done) => {
      adminSocket = connectSocketClient(adminToken, httpServerAddr);
      userSocket = connectSocketClient(userToken, httpServerAddr);
      otherAdminSocket = connectSocketClient(otherAdminToken, httpServerAddr);

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
            qna_id: 15,
            admin_email: "admin1@example.com",
            user_email: "user3@example.com",
            content: "Hello",
            to: "student",
            is_read: 0,
          });
          done();
        });
      });
      it("should update is_read column", (done) => {
        adminSocket.emit(Event.READ_CHECK, "user3@example.com");
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
        newSocket.on("error", (err) => {
          newSocket.disconnect();
          done();
        });
      });
      it("should return error with refresh token", (done) => {
        const newSocket = connectSocketClient(
          sign({ type: "refresh_token" }, jwtSecret, {
            expiresIn: "3m",
            subject: "user3@example.com",
          }),
          httpServerAddr
        );
        newSocket.on("error", (err) => {
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
      query: `auth_token=${token}`,
    }
  );
}

function disconnectSocket(socket: Socket) {
  if (socket.connected) {
    socket.disconnect();
  }
}

function generateToken(email: string) {
  return sign({ type: "access_token" }, jwtSecret, {
    expiresIn: "3m",
    subject: email,
  });
}
