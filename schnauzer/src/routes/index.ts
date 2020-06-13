import { Router } from "express";
import { ChatController } from "../controller/chat.controller";
import jwtCheck from "../middleware/jwtCheck";

const router = Router();

router.get("/chats", jwtCheck, ChatController.getChats);

export default router;
