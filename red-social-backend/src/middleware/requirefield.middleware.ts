import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";
import { HttpStatus } from "../utils/httpStatus";

export const requireBodyFields =
    (fields: string[]) =>
    (req: Request, _res: Response, next: NextFunction) => {
        for (const field of fields) {
            const value = req.body?.[field];

            if (value === undefined || value === null || value === "") {
                throw new AppError(
                    `${field} requerido`,
                    HttpStatus.BAD_REQUEST,
                );
            }
        }

        next();
    };
