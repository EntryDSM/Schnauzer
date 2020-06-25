// @ts-ignore
import * as chaiHttp from "chai-http";
import * as chai from "chai";
import * as jwt from "jsonwebtoken";
import {
  Connection,
  createConnection,
  getConnection,
  Repository,
} from "typeorm";
import {
  chatExample,
  getChatsExpectedResult,
  getLastChatsExpectedResult,
  getChatsWithEmailExpectedResult,
  searchResult,
  searchResult2,
  getChatsExpectedResult2,
  postChatAdminResult,
  postChatUserResult,
} from "./data/chat";
import { users } from "./data/user";
import { admins } from "./data/admin";
import server from "../app";
import { Qna } from "../entity/qna";
import { dbOptions, jwtSecret } from "../config";
import { User } from "../entity/user";
import { Admin } from "../entity/admin";
import { createDeflateRaw } from "zlib";

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
  Promise.all(savePromises)
    .then(() => done())
    .catch((err) => console.log(err));
});

afterEach((done) => {
  const qnaRepo: Repository<Qna> = connection.getRepository(Qna);
  const userRepo: Repository<User> = connection.getRepository(User);
  const adminRepo: Repository<Admin> = connection.getRepository(Admin);
  Promise.all([qnaRepo.clear(), userRepo.clear(), adminRepo.clear()]).then(() =>
    done()
  );
});

describe("GET /qna/chats", () => {
  describe("success", () => {
    it("should return expected object", (done) => {
      chai
        .request(server.application)
        .get("/qna/chats")
        .set({ Authorization: validToken })
        .query({ page: 0 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a.instanceOf(Array);
          res.body.should.deep.equal(getChatsExpectedResult);
          done();
        });
    });
    it("should return length-1 array", (done) => {
      chai
        .request(server.application)
        .get("/qna/chats")
        .set({ Authorization: validToken })
        .query({ page: 1 })
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
        .get("/qna/chats")
        .set({ Authorization: invalidSecretToken })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it("should have status 409 with amdin email token", (done) => {
      chai
        .request(server.application)
        .get("/qna/chats")
        .set({ Authorization: adminEmailToken })
        .query({ page: 0 })
        .end((err, res) => {
          res.should.have.status(409);
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
        .get("/qna/last-chats")
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
    it("should have status 409 with user token", (done) => {
      chai
        .request(server.application)
        .get("/qna/last-chats")
        .set({ Authorization: validToken })
        .end((err, res) => {
          res.should.have.status(409);
          done();
        });
    });
  });
});

describe("GET /qna/chats/:email", () => {
  describe("succeess", () => {
    it("should return expected object", (done) => {
      chai
        .request(server.application)
        .get("/qna/chats/user1@example.com")
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
    it("should have status 409 with user token", (done) => {
      chai
        .request(server.application)
        .get("/qna/chats/user1@example.com")
        .set({ Authorization: validToken })
        .query({ page: 0 })
        .end((err, res) => {
          res.should.have.status(409);
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
        .get(`/qna/search/${encodeURI("예시")}`)
        .set({ Authorization: adminEmailToken })
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
        .get(`/qna/search/${encodeURI("김예")}`)
        .set({ Authorization: adminEmailToken })
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
        .get(`/qna/search/${encodeURI("노바디")}`)
        .set({ Authorization: adminEmailToken })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a.instanceOf(Array);
          res.body.should.deep.equal([]);
          done();
        });
    });
  });
  describe("fail", () => {
    it("should have status 409 with user token", (done) => {
      chai
        .request(server.application)
        .get(`/qna/search/${encodeURI("예시")}`)
        .set({ Authorization: validToken })
        .query({ page: 0 })
        .end((err, res) => {
          res.should.have.status(409);
          done();
        });
    });
  });
});

describe("POST /qna/chat-user", () => {
  describe("success", () => {
    it("should return expected object", (done) => {
      chai
        .request(server.application)
        .post("/qna/chat-user")
        .set({ Authorization: validToken })
        .send({ content: "ㅎㅇ" })
        .end((err, res) => {
          delete res.body.created_at;
          res.body.should.deep.equal(postChatUserResult);
          res.should.have.status(200);
          done();
        });
    });
  });
  describe("fail", () => {
    it("should have status 409 with admin token", (done) => {
      chai
        .request(server.application)
        .post("/qna/chat-user")
        .set({ Authorization: adminEmailToken })
        .send({ content: "ㅎㅇ" })
        .end((err, res) => {
          res.should.have.status(409);
          done();
        });
    });
    it("should have status 400 with wrong parameter", (done) => {
      chai
        .request(server.application)
        .post("/qna/chat-user")
        .set({ Authorization: validToken })
        .send({ content: "" })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});

describe("POST /qna/chat-admin", () => {
  describe("success", () => {
    it("should return expected object", (done) => {
      chai
        .request(server.application)
        .post("/qna/chat-admin")
        .set({ Authorization: adminEmailToken })
        .send({ content: "ㅎㅇ", userEmail: "user3@example.com" })
        .end((err, res) => {
          delete res.body.created_at;
          res.should.have.status(200);
          res.body.should.deep.equal(postChatAdminResult);
          done();
        });
    });
  });
  describe("fail", () => {
    it("should have status 409 with user token", (done) => {
      chai
        .request(server.application)
        .post("/qna/chat-admin")
        .set({ Authorization: validToken })
        .send({ content: "ㅎㅇ", userEmail: "user3@example.com" })
        .end((err, res) => {
          res.should.have.status(409);
          done();
        });
    });
    it("should have status 400 with wrong parameter", (done) => {
      chai
        .request(server.application)
        .post("/qna/chat-admin")
        .set({ Authorization: adminEmailToken })
        .send({ content: "", userEmail: "user3@example.com" })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});
