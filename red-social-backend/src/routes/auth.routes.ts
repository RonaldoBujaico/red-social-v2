import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);
router.get("/verify/:token", authController.verify);
router.post("/resend-verification", authController.resendVerification);

router.post("/logout", authMiddleware, authController.logout);



router.get("/sessions", authMiddleware, authController.getSessions);
router.post("/sessions/trust", authMiddleware, authController.trustDevice);
router.post("/sessions/block", authMiddleware, authController.blockDevice);

router.get("/sessions/trust-email", authController.trustDeviceFromEmail);
router.get("/sessions/block-email", authController.blockDeviceFromEmail);

router.patch("/change-password", authMiddleware, authController.changePassword);

router.delete("/sessions/:token", authMiddleware, authController.revokeSession);
router.delete("/sessions", authMiddleware, authController.logoutAll);

export default router;
