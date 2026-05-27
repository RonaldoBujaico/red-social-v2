import * as notificationService from "../services/notification.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/response";

export const getMyNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await notificationService.getMyNotifications(userId);

    return sendResponse(res, result, "Notificaciones obtenidas");
});

export const markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await notificationService.markAllAsRead(userId);

    return sendResponse(res, result, "Notificaciones marcadas como leídas");
});