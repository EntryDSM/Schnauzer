import { Router } from "express";
import { ChatController } from "../controller/chat.controller";
import jwtCheck from "../middleware/jwtCheck";
import { SearchController } from "../controller/search.controller";

const router = Router();

router.get("/chats", jwtCheck, ChatController.getChats);
router.get("/chats/:email", jwtCheck, ChatController.getChatsWithEmail);
router.get("/last-chats", jwtCheck, ChatController.getLastChats);
router.get("/search/:name", jwtCheck, SearchController.searchByName);

export default router;
