// @ts-ignore
import * as chaiHttp from "chai-http";
import * as chai from "chai";
import * as jwt from "jsonwebtoken";
import { Connection, createConnection, Repository } from "typeorm";
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
import { jwtSecret } from "../global/config";
import { User } from "../entity/user";
import { Admin } from "../entity/admin";

chai.should();
chai.use(chaiHttp);
let connection: Connection, validToken, invalidSecretToken, adminEmailToken;

function generateToken(type: string, secret: string, subject: string) {
  return "Bearer " + jwt.sign({ type }, secret, { subject, expiresIn: "3m" });
}

before((done) => {
  validToken = generateToken("access_token", jwtSecret, "user3@example.com");
  invalidSecretToken = generateToken(
    "access_token",
    "invalid secret",
    "user3@example.com"
  );
  adminEmailToken = generateToken(
    "access_token",
    jwtSecret,
    "admin1@example.com"
  );
  createConnection().then((c) => {
    connection = c;
    const qnaRepo = connection.getRepository(Qna);
    const userRepo = connection.getRepository(User);
    const adminRepo = connection.getRepository(Admin);
    let savePromises = [];
    admins.forEach((admin) => {
      savePromises.push(adminRepo.save(adminRepo.create(admin)));
    });
    users.forEach((user) => {
      savePromises.push(userRepo.save(userRepo.create(user)));
    });
    chatExample.forEach((chat) => {
      savePromises.push(qnaRepo.save(qnaRepo.create(chat)));
    });
    Promise.all(savePromises)
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
    it("should have status 403 with amdin email token", (done) => {
      chai
        .request(server.application)
        .get("/v5/qna/chats")
        .set({ Authorization: adminEmailToken })
        .query({ offset: 0 })
        .end((err, res) => {
          res.should.have.status(403);
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
    it("should have status 403 with user token", (done) => {
      chai
        .request(server.application)
        .get("/v5/qna/last-chats")
        .set({ Authorization: validToken })
        .query({ offset: 0 })
        .end((err, res) => {
          res.should.have.status(403);
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
    it("should have status 403 with user token", (done) => {
      chai
        .request(server.application)
        .get("/v5/qna/chats/30001")
        .set({ Authorization: validToken })
        .query({ offset: 0 })
        .end((err, res) => {
          res.should.have.status(403);
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
    it("should have status 403 with user token", (done) => {
      chai
        .request(server.application)
        .get(`/v5/qna/search/${encodeURI("예시")}`)
        .set({ Authorization: validToken })
        .query({ offset: 0 })
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });
  });
});
