import { ErrorCode } from "../utils/errorCodes";
import { ErrorHttpMap } from "../utils/errorMap";
import { HttpStatus } from "../utils/httpStatus";

export class AppError extends Error {
    public statusCode: number;
    public code: ErrorCode;

    constructor(
        message: string,
        statusCode?: HttpStatus,
        code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    ) {
        super(message);

        this.code = code;

        this.statusCode = statusCode || ErrorHttpMap[code] || 500;
    }
}
