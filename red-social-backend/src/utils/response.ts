import { Response } from "express";
import { HttpStatus } from "./httpStatus";

export const sendResponse = <T>(
    res: Response,
    data: T,
    message = "OK",
    status: HttpStatus = HttpStatus.OK,
) => {
    return res.status(status).json({
        success: true,
        message,
        data,
    });
};
