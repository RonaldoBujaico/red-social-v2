import { Router } from "express";
import * as userSettingsController from "../controllers/user-settings.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, userSettingsController.getMySettings);
router.patch("/", authMiddleware, userSettingsController.updateMySettings);

export default router;