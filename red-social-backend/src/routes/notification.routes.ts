import { Router } from "express";
import * as notificationController from "../controllers/notification.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, notificationController.getMyNotifications);
router.patch(
    "/read-all",
    authMiddleware,
    notificationController.markAllAsRead,
);

export default router;