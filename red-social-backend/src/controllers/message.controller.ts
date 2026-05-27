import * as messageService from "../services/message.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/response";
import { HttpStatus } from "../utils/httpStatus";

export const sendMessage = asyncHandler(async (req, res) => {
    const senderId = req.user.id;
    const receiverId = Number(req.params.receiverId);
    const { content } = req.body;

    const result = await messageService.sendMessage(
        senderId,
        receiverId,
        content,
    );

    return sendResponse(res, result, "Mensaje enviado", HttpStatus.CREATED);
});

export const getConversation = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const friendId = Number(req.params.friendId);

    const result = await messageService.getConversation(userId, friendId);

    return sendResponse(res, result, "Conversación obtenida");
});

export const markConversationAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const friendId = Number(req.params.friendId);

    const result = await messageService.markConversationAsRead(
        userId,
        friendId,
    );

    return sendResponse(res, result, "Conversación marcada como leída");
});