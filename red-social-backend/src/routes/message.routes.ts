import { Router } from "express";
import * as messageController from "../controllers/message.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get(
    "/conversation/:friendId",
    authMiddleware,
    messageController.getConversation,
);

router.post(
    "/:receiverId",
    authMiddleware,
    messageController.sendMessage,
);

router.patch(
    "/conversation/:friendId/read",
    authMiddleware,
    messageController.markConversationAsRead,
);

export default router;