import { Router } from "express";
import { ChatController } from "../controller/chat.controller";
import jwtCheck from "../middleware/jwtCheck";
import { SearchController } from "../controller/search.controller";
import { isAdmin, isUser } from "../middleware/userCheck";

const router = Router();

router.get("/chats", jwtCheck, isUser, ChatController.getChats);
router.get(
  "/chats/:email",
  jwtCheck,
  isAdmin,
  ChatController.getChatsWithEmail
);
router.get("/last-chats", jwtCheck, isAdmin, ChatController.getLastChats);
router.get("/search/:name", jwtCheck, isAdmin, SearchController.searchByName);
router.post("/chat-user", jwtCheck, isUser, ChatController.postChatUser);
router.post("/chat-admin", jwtCheck, isAdmin, ChatController.postChatAdmin);

export default router;
