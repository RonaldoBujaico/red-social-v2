import { sendResponse } from "./../utils/response";
import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { VerifyParams } from "../types/authRequest";
import { parseDevice } from "../utils/device";
import { asyncHandler, asyncHandlerRedirect } from "../utils/asyncHandler";
import { AppError } from "../errors/AppError";
import { HttpStatus } from "../utils/httpStatus";

const FRONTEND_URL = process.env.FRONTED_URL || "http://localhost:5173";

export const register = asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);

    return sendResponse(res, result, "Usuario registrado", HttpStatus.CREATED);
});

export const login = asyncHandler(async (req, res) => {
    const deviceInfo = parseDevice(req.headers["user-agent"] || "");

    const result = await authService.login(req.body, {
        os: deviceInfo.os,
        browser: deviceInfo.browser,
        ip: req.ip,
        type: deviceInfo.type,
    });

    return sendResponse(res, result, "Login exitoso");
});

export const verify = asyncHandlerRedirect({
    successRedirect: `${FRONTEND_URL}/verify?status=success`,
    errorRedirect: `${FRONTEND_URL}/verify?status=error&`,
})(async (req, res) => {
    const { token } = req.params;

    if (!token) {
        throw new AppError("Token requerido", HttpStatus.BAD_REQUEST);
    }

    await authService.verifyAccount(token as string);
});
export const resendVerification = asyncHandler(async (req, res) => {
    const result = await authService.resendVerification(req.body);

    return sendResponse(res, result, "Nuevo codigo enviado, revisa tu correo", HttpStatus.CREATED);
});


export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new AppError("Refresh token requerido", HttpStatus.BAD_REQUEST);
    }

    const result = await authService.refresh(refreshToken);

    return sendResponse(res, result, "Token renovado");
});

export const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new AppError("Refresh token requerido", HttpStatus.BAD_REQUEST);
    }

    await authService.logout(refreshToken);

    return sendResponse(res, null, "Logout exitoso");
});

export const getSessions = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const sessions = await authService.getSessions(userId);

    return sendResponse(res, sessions, "Sesiones obtenidas");
});

export const revokeSession = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.params.token;
        if (!token) throw new AppError("Token requerido", 400);

        const result = await authService.revokeSession(token as string);

        return sendResponse(res, result, "Sesión cerrada");
    },
);
export const trustDevice = asyncHandler(async (req, res) => {
    const { token } = req.body;

    const response = await authService.trustDevice(req.user.id, token);

    return sendResponse(
        res,
        response,
        response.isTrusted ? "Dispositivo confiable" : "Ya era confiable",
    );
});

export const blockDevice = asyncHandler(async (req, res) => {
    const { token } = req.query;

    const result = await authService.blockDevice(req.user.id, token as string);

    return sendResponse(res, result, "Dispositivo bloqueado");
});

export const logoutAll = asyncHandler(async (req: any, res) => {
    const userId = req.user.id;

    const result = await authService.logoutAll(userId);

    return sendResponse(res, result, "Sesiones cerradas");
});

export const trustDeviceFromEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    if (!token) {
        throw new AppError("Token requerido", 400);
    }

    await authService.trustDeviceByToken(token as string);

    return res.redirect("http://localhost:5173/security/success");
});

export const blockDeviceFromEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    if (!token) {
        throw new AppError("Token requerido", 400);
    }

    await authService.blockDeviceByToken(token as string);

    return res.send(`
        <h2>🚫 Dispositivo bloqueado</h2>
        <p>La sesión fue cerrada.</p>
    `);
});

export const changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const result = await authService.changePassword(
        userId,
        currentPassword,
        newPassword,
    );

    return sendResponse(res, result, "Contraseña actualizada correctamente");
});