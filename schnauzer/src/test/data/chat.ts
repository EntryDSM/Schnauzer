import { ADMIN, STUDENT } from "../../entity/qna";

export const chatExample = [
  {
    qna_id: 1,
    admin_email: "admin1@example.com",
    user_receipt_code: 30001,
    to: ADMIN,
    content: "안녕하세요",
    created_at: "2020-06-03T05:12:40.000Z",
    is_read: false,
  },
  {
    qna_id: 2,
    admin_email: "admin1@example.com",
    user_receipt_code: 30002,
    to: STUDENT,
    content: "반갑습니다",
    created_at: "2020-06-03T05:13:40.000Z",
    is_read: false,
  },
  {
    qna_id: 3,
    admin_email: "admin2@example.com",
    user_receipt_code: 30003,
    to: STUDENT,
    content: "무슨 일 하세요?",
    created_at: "2020-06-03T05:15:40.000Z",
    is_read: false,
  },
  {
    qna_id: 4,
    admin_email: "admin1@example.com",
    user_receipt_code: 30001,
    to: ADMIN,
    content: "안녕하세요",
    created_at: "2020-06-03T05:16:40.000Z",
    is_read: false,
  },
  {
    qna_id: 5,
    admin_email: "admin2@example.com",
    user_receipt_code: 30003,
    to: ADMIN,
    content: "공부합니다.",
    created_at: "2020-06-03T05:17:40.000Z",
    is_read: false,
  },
  {
    qna_id: 6,
    admin_email: "admin2@example.com",
    user_receipt_code: 30003,
    to: STUDENT,
    content: "아 그렇군요.",
    created_at: "2020-06-03T05:18:40.000Z",
    is_read: false,
  },
  {
    qna_id: 7,
    admin_email: "admin2@example.com",
    user_receipt_code: 30003,
    to: STUDENT,
    content: "열심히 하세요.",
    created_at: "2020-06-03T05:20:40.000Z",
    is_read: false,
  },
  {
    qna_id: 8,
    admin_email: "admin2@example.com",
    user_receipt_code: 30003,
    to: STUDENT,
    content: "화이팅.",
    created_at: "2020-06-03T05:22:40.000Z",
    is_read: false,
  },
  {
    qna_id: 9,
    admin_email: "admin2@example.com",
    user_receipt_code: 30003,
    to: ADMIN,
    content: "감사합니다.",
    created_at: "2020-06-03T05:23:40.000Z",
    is_read: false,
  },
  {
    qna_id: 10,
    admin_email: "admin2@example.com",
    user_receipt_code: 30003,
    to: ADMIN,
    content: "감사합니다.",
    created_at: "2020-06-03T05:24:40.000Z",
    is_read: false,
  },
  {
    qna_id: 11,
    admin_email: "admin2@example.com",
    user_receipt_code: 30003,
    to: ADMIN,
    content: "감사합니다.",
    created_at: "2020-06-03T05:25:40.000Z",
    is_read: false,
  },
  {
    qna_id: 12,
    admin_email: "admin2@example.com",
    user_receipt_code: 30003,
    to: ADMIN,
    content: "감사합니다.",
    created_at: "2020-06-03T05:26:40.000Z",
    is_read: false,
  },
  {
    qna_id: 13,
    admin_email: "admin2@example.com",
    user_receipt_code: 30003,
    to: ADMIN,
    content: "감사합니다.",
    created_at: "2020-06-03T05:27:40.000Z",
    is_read: false,
  },
  {
    qna_id: 14,
    admin_email: "admin2@example.com",
    user_receipt_code: 30003,
    to: ADMIN,
    content: "감사합니다.",
    created_at: "2020-06-03T05:28:40.000Z",
    is_read: false,
  },
];

export const getChatsExpectedResult = chatExample
  .filter((v) => v.user_receipt_code === 30003)
  .reverse()
  .slice(0, 10)
  .map((v) => {
    return {
      ...v,
      is_read: 0,
    };
  });

export const getChatsExpectedResult2 = chatExample
  .filter((v) => v.user_receipt_code === 30003)
  .reverse()
  .slice(10, 11)
  .map((v) => {
    return {
      ...v,
      is_read: 0,
    };
  });

export const getLastChatsExpectedResult = [
  {
    qna_id: 14,
    admin_email: "admin2@example.com",
    user_receipt_code: 30003,
    to: ADMIN,
    content: "감사합니다.",
    is_read: 0,
    created_at: "2020-06-03T05:28:40.000Z",
    user: {
      email: "user3@example.com",
      receipt_code: 30003,
      name: "박예시",
    },
  },
  {
    qna_id: 4,
    admin_email: "admin1@example.com",
    user_receipt_code: 30001,
    to: ADMIN,
    content: "안녕하세요",
    is_read: 0,
    created_at: "2020-06-03T05:16:40.000Z",
    user: {
      email: "user1@example.com",
      receipt_code: 30001,
      name: "김예시",
    },
  },
  {
    qna_id: 2,
    admin_email: "admin1@example.com",
    user_receipt_code: 30002,
    to: STUDENT,
    content: "반갑습니다",
    is_read: 0,
    created_at: "2020-06-03T05:13:40.000Z",
    user: {
      email: "user2@example.com",
      receipt_code: 30002,
      name: "이예시",
    },
  },
];

export const getChatsWithEmailExpectedResult = chatExample
  .filter((v) => v.user_receipt_code === 30001)
  .reverse()
  .map((v) => {
    return {
      ...v,
      is_read: 0,
    };
  });

export const searchResult = [
  {
    qna_id: 14,
    admin_email: "admin2@example.com",
    user_receipt_code: 30003,
    to: ADMIN,
    content: "감사합니다.",
    is_read: 0,
    created_at: "2020-06-03T05:28:40.000Z",
    user: {
      email: "user3@example.com",
      receipt_code: 30003,
      name: "박예시",
    },
  },
  {
    qna_id: 4,
    admin_email: "admin1@example.com",
    user_receipt_code: 30001,
    to: ADMIN,
    content: "안녕하세요",
    is_read: 0,
    created_at: "2020-06-03T05:16:40.000Z",
    user: {
      email: "user1@example.com",
      receipt_code: 30001,
      name: "김예시",
    },
  },
  {
    qna_id: 2,
    admin_email: "admin1@example.com",
    user_receipt_code: 30002,
    to: STUDENT,
    content: "반갑습니다",
    is_read: 0,
    created_at: "2020-06-03T05:13:40.000Z",
    user: {
      email: "user2@example.com",
      receipt_code: 30002,
      name: "이예시",
    },
  },
];

export const searchResult2 = [
  {
    qna_id: 4,
    admin_email: "admin1@example.com",
    user_receipt_code: 30001,
    to: ADMIN,
    content: "안녕하세요",
    is_read: 0,
    created_at: "2020-06-03T05:16:40.000Z",
    user: {
      email: "user1@example.com",
      receipt_code: 30001,
      name: "김예시",
    },
  },
];
