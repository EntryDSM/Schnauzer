import { Router } from "express";
import { ChatController } from "../controller/chat.controller";
import jwtCheck from "../middleware/jwtCheck";

const router = Router();

router.get("/chats", jwtCheck, ChatController.getChats);
router.get("/chats/:email", jwtCheck, ChatController.getChatsWithEmail);
router.get("/last-chats", jwtCheck, ChatController.getLastChats);

export default router;
