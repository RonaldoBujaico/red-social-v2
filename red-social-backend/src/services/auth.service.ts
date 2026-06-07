import { AppDataSource } from "../config/data-source";
import { DataEmail, LoginDto, RegisterDto } from "../dtos/auth.dto";
import { User } from "../entities/User";
import { UserProfile } from "../entities/UserProfile";
import { hashPassword, comparePassword } from "../utils/hash";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../utils/jwt";
import { validateUpnEmail, validateUserFormat } from "../utils/validators";
import { RefreshToken } from "../entities/RefreshToken";
import { generateVerificationToken } from "../utils/verification";
import { VerificationToken } from "../entities/VerificationToket";
import { sendLoginAlertEmail, sendVerificationEmail } from "../utils/sendEmail";
import { getCountryFromIP, parseDevice } from "../utils/device";
import { AppError } from "../errors/AppError";
import { HttpStatus } from "../utils/httpStatus";
import { ErrorCode } from "../utils/errorCodes";


const userRepo = AppDataSource.getRepository(User);
const profileRepo = AppDataSource.getRepository(UserProfile);
const refreshRepo = AppDataSource.getRepository(RefreshToken);
const verificationRepo = AppDataSource.getRepository(VerificationToken);

export const register = async (data: RegisterDto) => {
    validateUserFormat(data);
    validateUpnEmail(data.email);

    const existingEmail = await userRepo.findOne({
        where: { email: data.email },
    });

    if (existingEmail) {
        throw new AppError(
            "Email ya registrado",
            HttpStatus.CONFLICT,
            ErrorCode.USER_ALREADY_EXISTS,
        );
    }

    const existingUsername = await profileRepo.findOne({
        where: { username: data.username },
    });

    if (existingUsername) {
        throw new AppError(
            "Username ya está en uso",
            HttpStatus.CONFLICT,
            ErrorCode.USER_ALREADY_EXISTS,
        );
    }

    const hashedPassword = await hashPassword(data.password);

    const user = userRepo.create({
        email: data.email,
        password: hashedPassword,
        role: "user",
        isActive: false,
        profile: {
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            birthDate: data.birthDate,
            gender: data.gender,
        },
    });

    await userRepo.save(user);

    const token = generateVerificationToken();

    const verification = verificationRepo.create({
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        user,
    });

    await verificationRepo.save(verification);

    await sendVerificationEmail(user.email, token);

    return {
        userId: user.id,
        email: user.email,
    };
};

export const resendVerification = async (data: DataEmail) => {
    const { email } = data;
    validateUpnEmail(email);

    const user = await userRepo.findOne({ where: { email } });

    if (!user) throw new AppError("Usuario no encontrado", 404);

    await verificationRepo.delete({ user: { id: user.id } });
    const token = generateVerificationToken();

    const verification = verificationRepo.create({
        token,
        user,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await verificationRepo.save(verification);

    await sendVerificationEmail(user.email, token);

    return { message: "Correo enviado" };
};

export const login = async (
    data: LoginDto,
    meta: { os?: string; browser?: string; ip?: string; type?: string },
) => {
    if (!data.email || !data.password) {
        throw new AppError(
            "Correo y contraseña son obligatorios",
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR,
        );
    }

    if (!data.email.endsWith("@upn.pe")) {
        throw new AppError(
            "Correo no válido",
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR,
        );
    }
    const user = await userRepo.findOne({
        where: { email: data.email },
        relations: ["profile", "interests", "skills", "courses", "researchTopics"],
    });

    if (!user)
        throw new AppError(
            "Credenciales incorrectas",
            HttpStatus.UNAUTHORIZED,
            ErrorCode.AUTH_INVALID_CREDENTIALS,
        );

    const isValid = await comparePassword(data.password, user.password);

    if (!user || !isValid) {
        throw new AppError(
            "Credenciales incorrectas",
            HttpStatus.UNAUTHORIZED,
            ErrorCode.AUTH_INVALID_CREDENTIALS,
        );
    }

    if (!user.isActive) {
        throw new AppError(
            "Cuenta no verificada",
            HttpStatus.FORBIDDEN,
            ErrorCode.AUTH_EMAIL_NOT_VERIFIED,
        );
    }

    if (user.isBanned) {
        throw new AppError(
            "Esta cuenta ha sido suspendida",
            HttpStatus.FORBIDDEN,
            ErrorCode.AUTH_UNAUTHORIZED,
        );
    }

    const country = getCountryFromIP(meta.ip || "");

    const existingSession = await refreshRepo.findOne({
        where: {
            user: { id: user.id },
            os: meta.os,
            browser: meta.browser,
        },
    });

    const isNewDevice = !existingSession;

    let refreshToken;

    if (existingSession) {
        refreshToken = existingSession.token;
    } else {
        refreshToken = generateRefreshToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        const session = refreshRepo.create({
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            user,
            os: meta.os,
            ip: meta.ip,
            browser: meta.browser,
            isTrusted: false,
            type: meta.type,
        });

        await refreshRepo.save(session);

        await sendLoginAlertEmail(user.email, {
            browser: meta.browser,
            os: meta.os,
            ip: meta.ip,
            token: refreshToken,
        });

        console.log("Nuevo dispositivo:", meta, country);
    }

    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };

    const accessToken = generateAccessToken(payload);

    const { password, ...userSafe } = user;

    return {
        accessToken,
        isNewDevice,
        refreshToken,
        user: userSafe,
    };
};

export const refresh = async (token: string) => {
    const stored = await refreshRepo.findOne({
        where: { token },
        relations: ["user"],
    });

    if (!stored) {
        throw new AppError(
            "Refresh token inválido",
            HttpStatus.UNAUTHORIZED,
            ErrorCode.SESSION_NOT_FOUND,
        );
    }

    if (stored.expiresAt < new Date()) {
        await refreshRepo.remove(stored);

        throw new AppError(
            "Refresh token expirado",
            HttpStatus.UNAUTHORIZED,
            ErrorCode.SESSION_EXPIRED,
        );
    }

    const payload: any = verifyRefreshToken(token);

    return {
        accessToken: generateAccessToken(payload),
    };
};

export const logout = async (token: string) => {
    const stored = await refreshRepo.findOne({
        where: { token },
    });

    if (stored) {
        await refreshRepo.remove(stored);
    }

    return true;
};

export const verifyAccount = async (token: string) => {
    const record = await verificationRepo.findOne({
        where: { token },
        relations: ["user"],
    });

    if (!record) {
        throw new AppError(
            "Token inválido",
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR,
        );
    }

    if (record.user.isActive) {
        throw new AppError(
            "La cuenta ya está verificada",
            HttpStatus.BAD_REQUEST,
            ErrorCode.AUTH_EMAIL_NOT_VERIFIED,
        );
    }

    if (record.expiresAt && record.expiresAt < new Date()) {
        throw new AppError(
            "Token expirado",
            HttpStatus.BAD_REQUEST,
            ErrorCode.AUTH_TOKEN_EXPIRED,
        );
    }

    record.user.isActive = true;

    await userRepo.save(record.user);
    await verificationRepo.delete(record.id);

    return { isVerify: true };
};

export const getSessions = async (userId: number) => {
    return await refreshRepo.find({
        where: {
            user: { id: userId },
        },
    });
};

export const revokeSession = async (token: string) => {
    const session = await refreshRepo.findOne({ where: { token } });

    if (!session) {
        throw new AppError(
            "Sesión no encontrada",
            HttpStatus.NOT_FOUND,
            ErrorCode.SESSION_NOT_FOUND,
        );
    }

    await refreshRepo.remove(session);

    return { isRevoked: true };
};

export const logoutAll = async (userId: number) => {
    await refreshRepo.delete({
        user: { id: userId },
    });

    return { islogoutAll: true };
};

export const trustDevice = async (userId: number, token: string) => {
    const session = await refreshRepo.findOne({
        where: { token },
        relations: ["user"],
    });

    if (!session) {
        throw new AppError(
            "Sesión no encontrada",
            HttpStatus.NOT_FOUND,
            ErrorCode.SESSION_NOT_FOUND,
        );
    }

    if (session.user.id !== userId) {
        throw new AppError(
            "No autorizado",
            HttpStatus.FORBIDDEN,
            ErrorCode.SESSION_UNAUTHORIZED,
        );
    }

    if (session.isTrusted) {
        return { isTrusted: false };
    }

    session.isTrusted = true;

    await refreshRepo.save(session);

    return { isTrusted: true };
};

export const blockDevice = async (userId: number, token: string) => {
    const session = await refreshRepo.findOne({
        where: { token },
        relations: ["user"],
    });

    if (!session) throw new AppError("Sesión no encontrada", 404);

    if (session.user.id !== userId) {
        throw new AppError("No autorizado", 403);
    }

    await refreshRepo.remove(session);

    return { isBlocked: true };
};

export const trustDeviceByToken = async (token: string) => {
    const session = await refreshRepo.findOne({ where: { token } });

    if (!session) throw new AppError("Sesión inválida", 404);

    session.isTrusted = true;

    await refreshRepo.save(session);
};

export const blockDeviceByToken = async (token: string) => {
    const session = await refreshRepo.findOne({ where: { token } });

    if (!session) throw new AppError("Sesión inválida", 404);

    session.isTrusted = false;

    await refreshRepo.save(session);
};

const userRepository = AppDataSource.getRepository(User);

export const changePassword = async (
    userId: number,
    currentPassword: string,
    newPassword: string,
) => {
    if (!currentPassword || !newPassword) {
        throw new AppError(
            "La contraseña actual y la nueva contraseña son obligatorias",
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR,
        );
    }

    if (newPassword.length < 6) {
        throw new AppError(
            "La nueva contraseña debe tener mínimo 6 caracteres",
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR,
        );
    }

    const user = await userRepository.findOne({
        where: {
            id: userId,
        },
    });

    if (!user) {
        throw new AppError(
            "Usuario no encontrado",
            HttpStatus.NOT_FOUND,
            ErrorCode.USER_NOT_FOUND,
        );
    }

    const isPasswordValid = await comparePassword(
        currentPassword,
        user.password,
    );

    if (!isPasswordValid) {
        throw new AppError(
            "La contraseña actual es incorrecta",
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR,
        );
    }

    user.password = await hashPassword(newPassword);

    await userRepository.save(user);

    return {
        updated: true,
    };
};
