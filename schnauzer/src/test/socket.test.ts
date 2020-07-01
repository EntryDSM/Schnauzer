import * as io from "socket.io-client";
import * as http from "http";
import * as ioBack from "socket.io";
import * as chai from "chai";
import Socket = SocketIOClient.Socket;
import { Server } from "http";
import IoServer = SocketIO.Server;
import { authenticate } from "socketio-jwt-auth";
import { jwtSecret } from "../config";
import { verifyFunc } from "../socket/verify";
import { sign } from "jsonwebtoken";
import socketInit from "../socket/index";
import { Event } from "../socket/entity/events";

chai.should();

let userSocket: Socket, adminSocket: Socket, otherAdminSocket: Socket;
let httpServer: Server;
let httpServerAddr;
let ioServer: IoServer;
let userToken: string, adminToken: string, otherAdminToken: string;

before((done) => {
  userToken = generateToken("user3@example.com");
  adminToken = generateToken("admin1@example.com");
  otherAdminToken = generateToken("admin2@example.com");

  httpServer = http.createServer().listen();
  httpServerAddr = httpServer.address();
  ioServer = ioBack(httpServer);
  socketInit(ioServer);
  done();
});

after((done) => {
  ioServer.close();
  httpServer.close();
  disconnectSocket(userSocket);
  disconnectSocket(adminSocket);
  disconnectSocket(otherAdminSocket);
  done();
});

describe("basic socket.io example", function () {
  describe("user", () => {
    before((done) => {
      userSocket = connectSocketClient(userToken, httpServerAddr);
      userSocket.on("connect", () => {
        console.log("connect");
      });
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
        message.should.be.an.instanceOf(Object);
        message.should.deep.equal({
          adminEmail: "broadcast@broadcast.com",
          userEmail: "user3@example.com",
          content: "안녕",
          to: "admin",
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

      userSocket.on("connect", () => {
        console.log("connect");
      });
      adminSocket.on("connect", () => {
        console.log("connect");
      });
      otherAdminSocket.on("connect", () => {
        console.log("connect");
      });
      done();
    });

    afterEach((done) => {
      done();
    });

    it("should communicate", (done) => {
      adminSocket.emit(Event.NEW_MESSAGE, {
        content: "Hello",
        userEmail: "user3@example.com",
      });
      adminSocket.on(Event.RECEIVE_MESSAGE, (message) => {
        message.should.deep.equal({
          adminEmail: "admin1@example.com",
          userEmail: "user3@example.com",
          content: "Hello",
          to: "student",
        });
        done();
      });
    });
    it("should update is_read column", (done) => {
      adminSocket.emit(Event.READ_CHECK, "user3@example.com");
      otherAdminSocket.on(Event.RECEIVE_READ_CHECK, (userEmail: string) => {
        console.log("response");
        done();
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
