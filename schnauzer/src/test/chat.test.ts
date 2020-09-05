// @ts-ignore
import * as chaiHttp from "chai-http";
import * as chai from "chai";
import * as jwt from "jsonwebtoken";
import { Connection, createConnection } from "typeorm";
import {
  chatExample,
  getChatsExpectedResult,
  getLastChatsExpectedResult,
  getChatsWithEmailExpectedResult,
  searchResult,
  searchResult2,
  getChatsExpectedResult2,
} from "./data/chat";
import { users } from "./data/user";
import { admins } from "./data/admin";
import server from "../app";
import { Qna } from "../entity/qna";
import { adminJwtSecret, mainJwtSecret } from "../global/config";
import { User } from "../entity/user";
import { Admin } from "../entity/admin";

chai.should();
chai.use(chaiHttp);
let connection: Connection, validToken, invalidSecretToken, adminEmailToken;

function generateUserToken(type: string, secret: string, subject: number) {
  return (
    "Bearer " +
    jwt.sign({ type }, secret, { subject: String(subject), expiresIn: "3m" })
  );
}

function generateAdminToken(type: string, secret: string, subject: string) {
  return (
    "Bearer " +
    jwt.sign({ type, identity: subject }, secret, { expiresIn: "3m" })
  );
}

before((done) => {
  validToken = generateUserToken("access_token", mainJwtSecret, 30003);
  invalidSecretToken = generateUserToken(
    "access_token",
    "invalid secret",
    30003
  );
  adminEmailToken = generateAdminToken(
    "access",
    adminJwtSecret,
    "admin1@example.com"
  );
  createConnection().then((c) => {
    connection = c;
    const qnaRepo = connection.getRepository(Qna);
    const userRepo = connection.getRepository(User);
    const adminRepo = connection.getRepository(Admin);
    const adminPromises = admins.map((admin) =>
      adminRepo.save(adminRepo.create(admin))
    );
    const userPromises = users.map((user) =>
      userRepo.save(userRepo.create(user))
    );
    const chatPromises = chatExample.map((chat) =>
      qnaRepo.save(qnaRepo.create(chat))
    );
    Promise.all(adminPromises)
      .then(() => Promise.all(userPromises))
      .then(() => Promise.all(chatPromises))
      .then(() => done())
      .catch((err) => console.log(err));
  });
});

describe("GET /qna/chats", () => {
  describe("success", () => {
    it("should return expected object", (done) => {
      chai
        .request(server.application)
        .get("/v5/qna/chats")
        .set({ Authorization: validToken })
        .query({ offset: 0 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a.instanceOf(Array);
          res.body.should.deep.equal(getChatsExpectedResult.reverse());
          done();
        });
    });
    it("should return length-1 array", (done) => {
      chai
        .request(server.application)
        .get("/v5/qna/chats")
        .set({ Authorization: validToken })
        .query({ offset: 10 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a.instanceOf(Array);
          res.body.should.deep.equal(getChatsExpectedResult2);
          done();
        });
    });
  });
  describe("fail", () => {
    it("should have status 401 with invalid token", (done) => {
      chai
        .request(server.application)
        .get("/v5/qna/chats")
        .set({ Authorization: invalidSecretToken })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it("should have status 401 with admin email token", (done) => {
      chai
        .request(server.application)
        .get("/v5/qna/chats")
        .set({ Authorization: adminEmailToken })
        .query({ offset: 0 })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});

describe("GET /qna/last-chats", () => {
  describe("success", () => {
    it("should return expected object", (done) => {
      chai
        .request(server.application)
        .get("/v5/qna/last-chats")
        .set({ Authorization: adminEmailToken })
        .query({ offset: 0 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a.instanceOf(Array);
          res.body.should.deep.equal(getLastChatsExpectedResult);
          done();
        });
    });
  });
  describe("fail", () => {
    it("should have status 401 with user token", (done) => {
      chai
        .request(server.application)
        .get("/v5/qna/last-chats")
        .set({ Authorization: validToken })
        .query({ offset: 0 })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});

describe("GET /qna/chats/:receiptCode", () => {
  describe("success", () => {
    it("should return expected object", (done) => {
      chai
        .request(server.application)
        .get("/v5/qna/chats/30001")
        .set({ Authorization: adminEmailToken })
        .query({ offset: 0 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a.instanceOf(Array);
          res.body.should.deep.equal(getChatsWithEmailExpectedResult.reverse());
          done();
        });
    });
  });
  describe("fail", () => {
    it("should have status 401 with user token", (done) => {
      chai
        .request(server.application)
        .get("/v5/qna/chats/30001")
        .set({ Authorization: validToken })
        .query({ offset: 0 })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});

describe("GET /qna/search/:name", () => {
  describe("success", () => {
    it("should return expected object", (done) => {
      chai
        .request(server.application)
        .get(`/v5/qna/search/${encodeURI("예시")}`)
        .set({ Authorization: adminEmailToken })
        .query({ offset: 0 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a.instanceOf(Array);
          res.body.should.deep.equal(searchResult);
          done();
        });
    });
    it("should return expected object", (done) => {
      chai
        .request(server.application)
        .get(`/v5/qna/search/${encodeURI("김예")}`)
        .set({ Authorization: adminEmailToken })
        .query({ offset: 0 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a.instanceOf(Array);
          res.body.should.deep.equal(searchResult2);
          done();
        });
    });
    it("should return empty array", (done) => {
      chai
        .request(server.application)
        .get(`/v5/qna/search/${encodeURI("노바디")}`)
        .set({ Authorization: adminEmailToken })
        .query({ offset: 0 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a.instanceOf(Array);
          res.body.should.deep.equal([]);
          done();
        });
    });
  });
  describe("fail", () => {
    it("should have status 401 with user token", (done) => {
      chai
        .request(server.application)
        .get(`/v5/qna/search/${encodeURI("예시")}`)
        .set({ Authorization: validToken })
        .query({ offset: 0 })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});
