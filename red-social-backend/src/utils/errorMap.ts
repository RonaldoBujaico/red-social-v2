import { ErrorCode } from "./errorCodes";
import { HttpStatus } from "./httpStatus";

export const ErrorHttpMap: Record<ErrorCode, HttpStatus> = {
    [ErrorCode.AUTH_INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
    [ErrorCode.AUTH_EMAIL_NOT_VERIFIED]: HttpStatus.FORBIDDEN,
    [ErrorCode.AUTH_TOKEN_EXPIRED]: HttpStatus.UNAUTHORIZED,
    [ErrorCode.AUTH_UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,

    [ErrorCode.USER_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [ErrorCode.USER_ALREADY_EXISTS]: HttpStatus.CONFLICT,

    [ErrorCode.SESSION_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [ErrorCode.SESSION_UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
    [ErrorCode.SESSION_EXPIRED]: HttpStatus.UNAUTHORIZED,

    [ErrorCode.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,

    [ErrorCode.NOT_FOUND]: HttpStatus.NOT_FOUND,

    [ErrorCode.INTERNAL_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
};
