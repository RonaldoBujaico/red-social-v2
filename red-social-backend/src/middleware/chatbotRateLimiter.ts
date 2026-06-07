import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/authRequest";
import { AppError } from "../errors/AppError";
import { HttpStatus } from "../utils/httpStatus";

const ipRequestMap = new Map<string, { count: number; resetTime: number }>();

export const chatbotRateLimiter = (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    
    if (!userId) {
        return next();
    }

    const key = `user_${userId}`;
    const now = Date.now();
    const WINDOW_MS = 60 * 1000; // 1 minuto
    const MAX_REQUESTS = 12; // Máximo 12 consultas al chatbot por minuto

    const requestData = ipRequestMap.get(key);

    if (!requestData) {
        ipRequestMap.set(key, { count: 1, resetTime: now + WINDOW_MS });
        return next();
    }

    if (now > requestData.resetTime) {
        // Ventana expirada: reiniciar contador
        ipRequestMap.set(key, { count: 1, resetTime: now + WINDOW_MS });
        return next();
    }

    if (requestData.count >= MAX_REQUESTS) {
        throw new AppError(
            "Límite excedido: Has realizado demasiadas solicitudes seguidas al chatbot. Por favor, espera un minuto para evitar el spam académico.",
            HttpStatus.TOO_MANY_REQUESTS
        );
    }

    requestData.count += 1;
    next();
};
