import * as userSettingsService from "../services/user-settings.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/response";

export const getMySettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await userSettingsService.getMySettings(userId);

    return sendResponse(res, result, "Configuración obtenida");
});

export const updateMySettings = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await userSettingsService.updateMySettings(
        userId,
        req.body,
    );

    return sendResponse(res, result, "Configuración actualizada");
});