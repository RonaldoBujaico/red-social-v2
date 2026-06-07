import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpStatus } from "../utils/httpStatus";
import { sendResponse } from "../utils/response";
import { AuthRequest } from "../types/authRequest";
import * as chatbotService from "../services/chatbot.service";
import {
    SendMessageSchema,
    CreateConversationSchema,
} from "../dtos/chatbot.dto";
import { AppError } from "../errors/AppError";

/**
 * Obtiene todas las conversaciones de chatbot del estudiante
 */
export const getConversations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const result = await chatbotService.getConversations(userId);
    return sendResponse(res, result, "Conversaciones obtenidas correctamente");
});

/**
 * Crea una nueva conversación de chatbot
 */
export const createConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const parse = CreateConversationSchema.safeParse(req.body);
    
    if (!parse.success) {
        throw new AppError("Datos inválidos: " + parse.error.message, HttpStatus.BAD_REQUEST);
    }

    const result = await chatbotService.createConversation(userId, parse.data.title);
    return sendResponse(res, result, "Conversación creada correctamente", HttpStatus.CREATED);
});

/**
 * Obtiene todos los mensajes de una conversación específica
 */
export const getConversationMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const convId = Number(req.params.id);
    
    const result = await chatbotService.getConversationMessages(userId, convId);
    return sendResponse(res, result, "Mensajes obtenidos correctamente");
});

/**
 * Envía un mensaje al chatbot, valida seguridad/moderación, procesa NLP y devuelve respuesta
 */
export const sendMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const parse = SendMessageSchema.safeParse(req.body);

    if (!parse.success) {
        const errorMsg = parse.error.issues[0]?.message || "Datos inválidos en el mensaje";
        throw new AppError(errorMsg, HttpStatus.BAD_REQUEST);
    }

    const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";
    const result = await chatbotService.processUserMessage(userId, parse.data, ip);
    
    return sendResponse(res, result, "Mensaje procesado correctamente");
});

/**
 * Obtiene las recomendaciones cacheadas del estudiante
 */
export const getCachedRecommendations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const result = await chatbotService.getCachedRecommendations(userId);
    return sendResponse(res, result, "Recomendaciones obtenidas correctamente");
});
