// @ts-ignore
import * as chaiHttp from "chai-http";
import * as chai from "chai";
import * as jwt from "jsonwebtoken";
import { createConnection, Repository } from "typeorm";
import {
  chatExample,
  getChatsExpectedResult,
  getLastChatsExpectedResult,
  getChatsWithEmailExpectedResult,
} from "./data/chat";
import server from "../app";
import { Qna } from "../entity/qna";
import { dbOptions, jwtSecret } from "../config";

chai.should();
chai.use(chaiHttp);
let connection, validToken, invalidToken;

before((done) => {
  validToken = jwt.sign({ email: "user3@example.com" }, jwtSecret, {
    expiresIn: "3m",
  });
  invalidToken = jwt.sign({ email: "user3@example.com" }, "invalid_secret", {
    expiresIn: "3m",
  });
  createConnection(dbOptions.CONNECTION_NAME).then((c) => {
    connection = c;
    done();
  });
});

beforeEach((done) => {
  const qnaRepo = connection.getRepository(Qna);
  let qnaSavePromises = [];
  chatExample.forEach((chat) => {
    const qna = qnaRepo.create(chat);
    qnaSavePromises.push(qnaRepo.save(qna));
  });
  Promise.all(qnaSavePromises).then(() => done());
});

afterEach((done) => {
  const qnaRepo: Repository<Qna> = connection.getRepository(Qna);
  qnaRepo.clear().then(() => done());
});

describe("GET /chats", () => {
  describe("success", () => {
    it("should return expected object", (done) => {
      chai
        .request(server.application)
        .get("/schnauzer/chats")
        .set({ Authorization: validToken })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a.instanceOf(Array);
          res.body.should.deep.equal(getChatsExpectedResult);
          done();
        });
    });
  });
  describe("fail", () => {
    it("should have status 401 with invalid token", (done) => {
      chai
        .request(server.application)
        .get("/schnauzer/chats")
        .set({ Authorization: invalidToken })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});

describe("GET /last-chats", () => {
  describe("success", () => {
    it("should return expected object", (done) => {
      chai
        .request(server.application)
        .get("/schnauzer/last-chats")
        .set({ Authorization: validToken })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a.instanceOf(Array);
          res.body.should.deep.equal(getLastChatsExpectedResult);
          done();
        });
    });
  });
  describe("fail", () => {});
});

describe("GET /schnauzer/chats/:email", () => {
  describe("succeess", () => {
    it("should return expected object", (done) => {
      chai
        .request(server.application)
        .get("/schnauzer/chats/user1@example.com")
        .set({ Authorization: validToken })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a.instanceOf(Array);
          res.body.should.deep.equal(getChatsWithEmailExpectedResult);
          done();
        });
    });
  });
  describe("fail", () => {});
});
