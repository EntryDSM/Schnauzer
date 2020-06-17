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
import { users } from "./data/user";
import { admins } from "./data/admin";
import server from "../app";
import { Qna } from "../entity/qna";
import { dbOptions, jwtSecret } from "../config";
import { User } from "../entity/user";
import { Admin } from "../entity/admin";

chai.should();
chai.use(chaiHttp);
let connection, validToken, invalidSecretToken, adminEmailToken;

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
  createConnection(dbOptions.CONNECTION_NAME).then((c) => {
    connection = c;
    done();
  });
});

beforeEach((done) => {
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
  Promise.all(savePromises).then(() => done());
});

afterEach((done) => {
  const qnaRepo: Repository<Qna> = connection.getRepository(Qna);
  const userRepo: Repository<User> = connection.getRepository(User);
  const adminRepo: Repository<Admin> = connection.getRepository(Admin);
  Promise.all([qnaRepo.clear(), userRepo.clear(), adminRepo.clear()]).then(() =>
    done()
  );
});

describe("GET /chats", () => {
  describe("success", () => {
    it("should return expected object", (done) => {
      chai
        .request(server.application)
        .get("/schnauzer/chats")
        .set({ Authorization: validToken })
        .query({ page: 0 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a.instanceOf(Array);
          res.body.should.deep.equal(getChatsExpectedResult);
          done();
        });
    });
    it("should return empty array", (done) => {
      chai
        .request(server.application)
        .get("/schnauzer/chats")
        .set({ Authorization: validToken })
        .query({ page: 1 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a.instanceOf(Array);
          res.body.should.deep.equal([]);
          done();
        });
    });
  });
  describe("fail", () => {
    it("should have status 401 with invalid token", (done) => {
      chai
        .request(server.application)
        .get("/schnauzer/chats")
        .set({ Authorization: invalidSecretToken })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it("should have status 400 with amdin email token", (done) => {
      chai
        .request(server.application)
        .get("/schnauzer/chats")
        .set({ Authorization: adminEmailToken })
        .query({ page: 0 })
        .end((err, res) => {
          res.should.have.status(400);
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
        .set({ Authorization: adminEmailToken })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a.instanceOf(Array);
          res.body.should.deep.equal(getLastChatsExpectedResult);
          done();
        });
    });
  });
  describe("fail", () => {
    it("should have status 400 with user token", (done) => {
      chai
        .request(server.application)
        .get("/schnauzer/last-chats")
        .set({ Authorization: validToken })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});

describe("GET /schnauzer/chats/:email", () => {
  describe("succeess", () => {
    it("should return expected object", (done) => {
      chai
        .request(server.application)
        .get("/schnauzer/chats/user1@example.com")
        .set({ Authorization: adminEmailToken })
        .query({ page: 0 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a.instanceOf(Array);
          res.body.should.deep.equal(getChatsWithEmailExpectedResult);
          done();
        });
    });
  });
  describe("fail", () => {
    it("should have status 400 with user token", (done) => {
      chai
        .request(server.application)
        .get("/schnauzer/chats/user1@example.com")
        .set({ Authorization: validToken })
        .query({ page: 0 })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});
