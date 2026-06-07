import { Router } from "express";
import * as chatbotController from "../controllers/chatbot.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { chatbotRateLimiter } from "../middleware/chatbotRateLimiter";

const router = Router();

// Todos los servicios del Chatbot requieren validación de JWT institucional
router.use(authMiddleware);

router.get("/conversations", chatbotController.getConversations);
router.post("/conversations", chatbotController.createConversation);
router.get("/conversations/:id/messages", chatbotController.getConversationMessages);
router.post("/message", chatbotRateLimiter, chatbotController.sendMessage);
router.get("/recommendations", chatbotController.getCachedRecommendations);

export default router;
