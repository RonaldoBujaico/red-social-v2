import { Router } from "express";
import * as postController from "../controllers/post.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { uploadPostImage } from "../middleware/upload.middleware";

const router = Router();

router.get("/me", authMiddleware, postController.getMyPosts);

router.post(
    "/",
    authMiddleware,
    uploadPostImage.single("image"),
    postController.create
);

router.get("/", authMiddleware, postController.getAll);

router.post("/:id/like", authMiddleware, postController.toggleLike);
router.post("/:id/comments", authMiddleware, postController.createComment);
router.get("/user/:userId", authMiddleware, postController.getPostsByUserId);

router.get("/:id", authMiddleware, postController.getOne);
router.put("/:id", authMiddleware, postController.update);
router.delete("/:id", authMiddleware, postController.remove);

router.patch(
    "/:id/visibility",
    authMiddleware,
    postController.updateVisibility,
);

export default router;