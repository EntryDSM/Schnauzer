import { Router } from "express";
import { ChatController } from "../controller/chat.controller";
import { SearchController } from "../controller/search.controller";
import { isAdmin, isUser } from "../middleware/userCheck";

const router = Router();

router.get("/chats", isUser, ChatController.getChats);
router.get("/chats/:receiptCode", isAdmin, ChatController.getChatsWithCode);
router.get("/last-chats", isAdmin, ChatController.getLastChats);
router.get("/search/:name", isAdmin, SearchController.searchByName);

export default router;
