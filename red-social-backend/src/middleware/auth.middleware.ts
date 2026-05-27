import { Response, NextFunction } from "express";
import {
    verifyAccessToken,
    verifyRefreshToken,
    generateAccessToken,
} from "../utils/jwt";
import { RefreshToken } from "../entities/RefreshToken";
import { User } from "../entities/User";
import { AppDataSource } from "../config/data-source";
import { AppError } from "../errors/AppError";
import { HttpStatus } from "../utils/httpStatus";
import { ErrorCode } from "../utils/errorCodes";
import { AuthRequest } from "../types/authRequest";

const refreshRepo = AppDataSource.getRepository(RefreshToken);
const userRepo = AppDataSource.getRepository(User);

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError(
                "No autorizado",
                HttpStatus.UNAUTHORIZED,
                ErrorCode.AUTH_UNAUTHORIZED,
            );
        }

        const accessToken = authHeader.split(" ")[1];

        try {
            const decoded = verifyAccessToken(accessToken);
            // Validar si el usuario existe y no está baneado
            const userObj = await userRepo.findOne({ where: { id: decoded.id } });
            if (!userObj) {
                throw new AppError(
                    "Usuario no encontrado",
                    HttpStatus.UNAUTHORIZED,
                    ErrorCode.USER_NOT_FOUND,
                );
            }
            if (userObj.isBanned) {
                throw new AppError(
                    "Esta cuenta ha sido suspendida",
                    HttpStatus.FORBIDDEN,
                    ErrorCode.AUTH_UNAUTHORIZED,
                );
            }
            req.user = decoded;
            return next();
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
        }

        const refreshToken = req.headers["x-refresh-token"] as string;

        if (!refreshToken) {
            throw new AppError(
                "Token expirado",
                HttpStatus.UNAUTHORIZED,
                ErrorCode.AUTH_TOKEN_EXPIRED,
            );
        }

        const stored = await refreshRepo.findOne({
            where: { token: refreshToken },
        });

        if (!stored) {
            throw new AppError(
                "Refresh inválido",
                HttpStatus.UNAUTHORIZED,
                ErrorCode.SESSION_NOT_FOUND,
            );
        }

        const payload = verifyRefreshToken(refreshToken);

        // Validar si el usuario está baneado al renovar el token
        const userObj = await userRepo.findOne({ where: { id: payload.id } });
        if (!userObj) {
            throw new AppError(
                "Usuario no encontrado",
                HttpStatus.UNAUTHORIZED,
                ErrorCode.USER_NOT_FOUND,
            );
        }
        if (userObj.isBanned) {
            throw new AppError(
                "Esta cuenta ha sido suspendida",
                HttpStatus.FORBIDDEN,
                ErrorCode.AUTH_UNAUTHORIZED,
            );
        }

        const newAccessToken = generateAccessToken({
            id: payload.id,
            email: payload.email,
            role: payload.role,
        });

        res.setHeader("x-access-token", newAccessToken);

        req.user = payload;

        next();
    } catch (error) {
        next(error);
    }
};

export const roleMiddleware = (allowedRoles: string[]) => {
    return async (
        req: AuthRequest,
        res: Response,
        next: NextFunction,
    ) => {
        if (!req.user) {
            return next(
                new AppError(
                    "No autenticado",
                    HttpStatus.UNAUTHORIZED,
                    ErrorCode.AUTH_UNAUTHORIZED,
                ),
            );
        }

        // Consultar rol directamente en BD
        const userObj = await userRepo.findOne({ where: { id: req.user.id } });
        if (!userObj) {
            return next(
                new AppError(
                    "Usuario no encontrado",
                    HttpStatus.UNAUTHORIZED,
                    ErrorCode.USER_NOT_FOUND,
                ),
            );
        }

        if (userObj.isBanned) {
            return next(
                new AppError(
                    "Esta cuenta ha sido suspendida",
                    HttpStatus.FORBIDDEN,
                    ErrorCode.AUTH_UNAUTHORIZED,
                ),
            );
        }

        if (!allowedRoles.includes(userObj.role)) {
            return next(
                new AppError(
                    "Acceso denegado",
                    HttpStatus.FORBIDDEN,
                    ErrorCode.AUTH_UNAUTHORIZED,
                ),
            );
        }

        next();
    };
};

export const adminMiddleware = roleMiddleware(["admin"]);

