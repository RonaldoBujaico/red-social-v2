import * as userService from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../errors/AppError";
import { HttpStatus } from "../utils/httpStatus";
import { ErrorCode } from "../utils/errorCodes";
import { sendResponse } from "../utils/response";
import { AppDataSource } from "../config/data-source";
import { UserProfile } from "../entities/UserProfile";
import { uploadToCloudinary } from "../utils/uploadToCloudinary";

export const create = asyncHandler(async (req, res) => {
    const result = await userService.createUser(req.body);

    return sendResponse(res, result, "Usuario creado", HttpStatus.CREATED);
});

export const getAll = asyncHandler(async (_req, res) => {
    const users = await userService.getUsers();

    return sendResponse(res, users, "Usuarios obtenidos");
});

export const getById = asyncHandler(async (req, res) => {
    const id = req.params.id;

    const user = await userService.getUserById(Number(id));

    if (!user) {
        throw new AppError(
            "Usuario no encontrado",
            HttpStatus.NOT_FOUND,
            ErrorCode.USER_NOT_FOUND,
        );
    }
    return sendResponse(res, user);
});

export const update = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const user = await userService.updateUser(id, req.body);
    return sendResponse(res, user, "Usuario Actualizado");
});

export const remove = asyncHandler(async (req, res) => {
    await userService.deleteUser(Number(req.params.id));

    return sendResponse(res, null, "Usuario eliminado");
});

export const updateMyAvatar = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    if (!req.file) {
        throw new AppError(
            "No se envió ninguna imagen",
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR,
        );
    }

    const profileRepository = AppDataSource.getRepository(UserProfile);

    const profile = await profileRepository.findOne({
        where: {
            user: {
                id: userId,
            },
        },
        relations: {
            user: true,
        },
    });

    if (!profile) {
        throw new AppError(
            "Perfil no encontrado",
            HttpStatus.NOT_FOUND,
            ErrorCode.USER_NOT_FOUND,
        );
    }

    const uploadedImage = await uploadToCloudinary(
        req.file.buffer,
        "red-social/profiles/avatars",
    );

    profile.avatar = uploadedImage.secure_url;

    await profileRepository.save(profile);

    return sendResponse(res, profile, "Foto de perfil actualizada");
});

export const updateMyCoverImage = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    if (!req.file) {
        throw new AppError(
            "No se envió ninguna imagen",
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR,
        );
    }

    const profileRepository = AppDataSource.getRepository(UserProfile);

    const profile = await profileRepository.findOne({
        where: {
            user: {
                id: userId,
            },
        },
        relations: {
            user: true,
        },
    });

    if (!profile) {
        throw new AppError(
            "Perfil no encontrado",
            HttpStatus.NOT_FOUND,
            ErrorCode.USER_NOT_FOUND,
        );
    }

    const uploadedImage = await uploadToCloudinary(
        req.file.buffer,
        "red-social/profiles/covers",
    );

    profile.coverImage = uploadedImage.secure_url;

    await profileRepository.save(profile);

    return sendResponse(res, profile, "Portada actualizada");
});

export const search = asyncHandler(async (req, res) => {
    const query = String(req.query.q || "");
    const currentUserId = req.user.id;

    const users = await userService.searchUsers(query, currentUserId);

    return sendResponse(res, users, "Usuarios encontrados");
});

export const sendFriendRequest = asyncHandler(async (req, res) => {
    const senderId = req.user.id;
    const receiverId = Number(req.params.id);

    const result = await userService.sendFriendRequest(senderId, receiverId);

    return sendResponse(
        res,
        result,
        "Solicitud de amistad enviada",
        HttpStatus.CREATED,
    );
});

export const getReceivedFriendRequests = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await userService.getReceivedFriendRequests(userId);

    return sendResponse(res, result, "Solicitudes obtenidas");
});

export const respondFriendRequest = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const requestId = Number(req.params.requestId);
    const { status } = req.body;

    if (status !== "accepted" && status !== "rejected") {
        throw new AppError(
            "Estado inválido",
            HttpStatus.BAD_REQUEST,
            ErrorCode.VALIDATION_ERROR,
        );
    }

    const result = await userService.respondFriendRequest(
        requestId,
        userId,
        status,
    );

    return sendResponse(res, result, "Solicitud respondida");
});

export const getAcceptedFriends = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const result = await userService.getAcceptedFriends(userId);

    return sendResponse(res, result, "Amigos aceptados obtenidos");
});
export const getSuggestedUsers = asyncHandler(async (req, res) => {
    const currentUserId = req.user.id;

    const result = await userService.getSuggestedUsers(currentUserId);

    return sendResponse(res, result, "Usuarios sugeridos obtenidos");
});