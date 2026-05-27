import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { HttpStatus } from "../utils/httpStatus";
import { ErrorCode } from "../utils/errorCodes";

export const validateIdParam = (paramName: string = "id") => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const value = Number(req.params[paramName]);

        if (!value || isNaN(value)) {
            return next(
                new AppError(
                    `${paramName} inválido`,
                    HttpStatus.BAD_REQUEST,
                    ErrorCode.VALIDATION_ERROR,
                ),
            );
        }

        req.params[paramName] = value as any;

        next();
    };
};
