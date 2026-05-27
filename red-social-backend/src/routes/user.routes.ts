import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { adminMiddleware, authMiddleware } from "../middleware/auth.middleware";
import { validateIdParam } from "../middleware/validateId.middleware";
import { uploadProfileImage } from "../middleware/profile-upload.middleware";

const router = Router();

router.post(
    "/create-user",
    authMiddleware,
    adminMiddleware,
    userController.create,
);

router.get("/", authMiddleware, adminMiddleware, userController.getAll);

router.get(
    "/search",
    authMiddleware,
    userController.search,
);

router.get(
    "/suggestions",
    authMiddleware,
    userController.getSuggestedUsers,
);

router.get(
    "/friend-requests/received",
    authMiddleware,
    userController.getReceivedFriendRequests,
);

router.post(
    "/:id/friend-request",
    authMiddleware,
    userController.sendFriendRequest,
);

router.patch(
    "/friend-requests/:requestId/respond",
    authMiddleware,
    userController.respondFriendRequest,
);

router.get(
    "/friends/accepted",
    authMiddleware,
    userController.getAcceptedFriends,
);

router.patch(
    "/profile/avatar",
    authMiddleware,
    uploadProfileImage.single("avatar"),
    userController.updateMyAvatar,
);

router.patch(
    "/profile/cover",
    authMiddleware,
    uploadProfileImage.single("coverImage"),
    userController.updateMyCoverImage,
);

router.get("/:id", authMiddleware, validateIdParam(), userController.getById);
router.put("/:id", authMiddleware, validateIdParam(), userController.update);
router.delete("/:id", authMiddleware, validateIdParam(), userController.remove);

export default router;