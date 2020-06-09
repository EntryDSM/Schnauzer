import { UserType } from "../../entity/qna";
import { User } from "../../entity/user";

export const chatExample = [
  {
    qna_id: 1,
    admin_email: "admin1@example.com",
    user_email: "user1@example.com",
    to: UserType.ADMIN,
    content: "안녕하세요",
    created_at: new Date("2020-06-03T05:12:40.000Z"),
  },
  {
    qna_id: 2,
    admin_email: "admin1@example.com",
    user_email: "user2@example.com",
    to: UserType.STUDENT,
    content: "반갑습니다",
    created_at: new Date("2020-06-03T05:13:40.000Z"),
  },
  {
    qna_id: 3,
    admin_email: "admin2@example.com",
    user_email: "user3@example.com",
    to: UserType.STUDENT,
    content: "무슨 일 하세요?",
    created_at: new Date("2020-06-03T05:15:40.000Z"),
  },
  {
    qna_id: 4,
    admin_email: "admin1@example.com",
    user_email: "user1@example.com",
    to: UserType.ADMIN,
    content: "안녕하세요",
    created_at: new Date("2020-06-03T05:16:40.000Z"),
  },
  {
    qna_id: 5,
    admin_email: "admin2@example.com",
    user_email: "user3@example.com",
    to: UserType.ADMIN,
    content: "공부합니다.",
    created_at: new Date("2020-06-03T05:17:40.000Z"),
  },
  {
    qna_id: 6,
    admin_email: "admin2@example.com",
    user_email: "user3@example.com",
    to: UserType.STUDENT,
    content: "아 그렇군요.",
    created_at: new Date("2020-06-03T05:18:40.000Z"),
  },
  {
    qna_id: 7,
    admin_email: "admin2@example.com",
    user_email: "user3@example.com",
    to: UserType.STUDENT,
    content: "열심히 하세요.",
    created_at: new Date("2020-06-03T05:20:40.000Z"),
  },
  {
    qna_id: 8,
    admin_email: "admin2@example.com",
    user_email: "user3@example.com",
    to: UserType.STUDENT,
    content: "화이팅.",
    created_at: new Date("2020-06-03T05:22:40.000Z"),
  },
  {
    qna_id: 9,
    admin_email: "admin2@example.com",
    user_email: "user3@example.com",
    to: UserType.ADMIN,
    content: "감사합니다.",
    created_at: new Date("2020-06-03T05:23:40.000Z"),
  },
];

export const getChatsExpectedResult = chatExample.filter(
  (v) => v.user_email === "user3@example.com"
);

export const getLastChatsExpectedResult = [
  {
    qna_id: 9,
    admin_email: "admin2@example.com",
    user_email: "user3@example.com",
    to: UserType.ADMIN,
    content: "감사합니다.",
    created_at: new Date("2020-06-03T05:23:40.000Z"),
  },
  {
    qna_id: 4,
    admin_email: "admin1@example.com",
    user_email: "user1@example.com",
    to: UserType.ADMIN,
    content: "안녕하세요",
    created_at: new Date("2020-06-03T05:16:40.000Z"),
  },
  {
    qna_id: 2,
    admin_email: "admin1@example.com",
    user_email: "user2@example.com",
    to: UserType.STUDENT,
    content: "반갑습니다",
    created_at: new Date("2020-06-03T05:13:40.000Z"),
  },
];

export const getChatsWithEmailExpectedResult = chatExample.filter(
  (v) => v.user_email === "user1@example.com"
);
