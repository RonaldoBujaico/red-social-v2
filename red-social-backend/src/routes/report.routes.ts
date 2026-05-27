import { Router } from "express";
import * as reportController from "../controllers/report.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, reportController.create);

export default router;
