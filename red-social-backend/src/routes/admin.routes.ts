import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import { authMiddleware, roleMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Aplicar middleware de autenticación a todas las rutas de administración
router.use(authMiddleware);

// Estadísticas del dashboard
router.get("/stats", roleMiddleware(["admin", "moderator"]), adminController.getStats);

// Obtener lista de usuarios, suspender usuarios, gestionar reportes y moderar contenido (accesible para admin y moderador)
router.get("/users", roleMiddleware(["admin", "moderator"]), adminController.getUsers);
router.patch("/users/:id/ban", roleMiddleware(["admin", "moderator"]), adminController.toggleUserBan);
router.post("/users/:id/warn", roleMiddleware(["admin", "moderator"]), adminController.sendWarning);

router.get("/reports", roleMiddleware(["admin", "moderator"]), adminController.getReports);
router.patch("/reports/:id/resolve", roleMiddleware(["admin", "moderator"]), adminController.resolveReport);

// Moderación de contenido
router.get("/posts", roleMiddleware(["admin", "moderator"]), adminController.getAllPosts);
router.delete("/posts/:id", roleMiddleware(["admin", "moderator"]), adminController.deletePost);
router.delete("/comments/:id", roleMiddleware(["admin", "moderator"]), adminController.deleteComment);

// Cambiar el rol de un usuario (exclusivo para administradores)
router.patch("/users/:id/role", roleMiddleware(["admin"]), adminController.updateUserRole);

export default router;
