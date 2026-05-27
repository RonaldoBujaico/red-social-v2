import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";

export const errorMiddleware = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    //console.error("MIDDLEWARE",err);

    const status = err.statusCode || 500;
    const message = err.message || "Error interno del servidor";

    res.status(status).json({
        success: false,
        message: err.message || "Error interno del servidor",
        code: err.code || "INTERNAL_ERROR",
    });
};
