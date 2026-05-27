import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../errors/AppError";
import { HttpStatus } from "../utils/httpStatus";
import { sendResponse } from "../utils/response";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { Report } from "../entities/Report";
import { Post } from "../entities/Post";
import { Comment } from "../entities/Comment";
import { AuthRequest } from "../types/authRequest";
import { Notification } from "../entities/Notification";
import { sendWarningEmail } from "../utils/sendEmail";

const userRepo = AppDataSource.getRepository(User);
const reportRepo = AppDataSource.getRepository(Report);
const postRepo = AppDataSource.getRepository(Post);
const commentRepo = AppDataSource.getRepository(Comment);

// GET /admin/stats
export const getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const [totalUsers, totalPosts, totalReports, totalComments] = await Promise.all([
        userRepo.count(),
        postRepo.count(),
        reportRepo.count(),
        commentRepo.count(),
    ]);

    const activeUsers = await userRepo.count({ where: { isActive: true } });
    const bannedUsers = await userRepo.count({ where: { isBanned: true } });
    const pendingReports = await reportRepo.count({ where: { status: "pending" } });
    const resolvedReports = await reportRepo.count({ where: { status: "resolved" } });
    const dismissedReports = await reportRepo.count({ where: { status: "dismissed" } });

    const adminCount = await userRepo.count({ where: { role: "admin" } });
    const moderatorCount = await userRepo.count({ where: { role: "moderator" } });
    const regularCount = await userRepo.count({ where: { role: "user" } });

    return sendResponse(res, {
        users: { total: totalUsers, active: activeUsers, banned: bannedUsers, admins: adminCount, moderators: moderatorCount, regular: regularCount },
        posts: { total: totalPosts },
        reports: { total: totalReports, pending: pendingReports, resolved: resolvedReports, dismissed: dismissedReports },
        comments: { total: totalComments },
    }, "Estadísticas obtenidas exitosamente");
});

// GET /admin/posts
export const getAllPosts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const posts = await postRepo.find({
        relations: ["user", "user.profile", "comments", "reactions"],
        order: { createdAt: "DESC" },
    });

    const safePosts = posts.map((post) => {
        const { password, ...safeUser } = post.user as any;
        return { ...post, user: safeUser };
    });

    return sendResponse(res, safePosts, "Posts obtenidos exitosamente");
});

// GET /admin/users
export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const users = await userRepo.find({
        relations: ["profile"],
        order: { id: "ASC" },
    });

    const safeUsers = users.map(({ password, ...user }) => user);
    return sendResponse(res, safeUsers, "Usuarios obtenidos exitosamente");
});

// PATCH /admin/users/:id/role
export const updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.params.id);
    const { role } = req.body;

    if (!role || !["user", "admin", "moderator"].includes(role)) {
        throw new AppError("Rol inválido o no proporcionado", HttpStatus.BAD_REQUEST);
    }

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
        throw new AppError("Usuario no encontrado", HttpStatus.NOT_FOUND);
    }

    user.role = role;
    await userRepo.save(user);

    const { password, ...safeUser } = user;
    return sendResponse(res, safeUser, `Rol de usuario actualizado a ${role}`);
});

// PATCH /admin/users/:id/ban
export const toggleUserBan = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.params.id);
    const { isBanned } = req.body;

    if (typeof isBanned !== "boolean") {
        throw new AppError("El estado isBanned debe ser un booleano", HttpStatus.BAD_REQUEST);
    }

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
        throw new AppError("Usuario no encontrado", HttpStatus.NOT_FOUND);
    }

    if (user.id === req.user.id) {
        throw new AppError("No puedes banearte a ti mismo", HttpStatus.BAD_REQUEST);
    }

    user.isBanned = isBanned;
    await userRepo.save(user);

    const { password, ...safeUser } = user;
    const msg = isBanned ? "Usuario suspendido correctamente" : "Suspensión del usuario removida";
    return sendResponse(res, safeUser, msg);
});

// GET /admin/reports
export const getReports = asyncHandler(async (req: AuthRequest, res: Response) => {
    const reports = await reportRepo.find({
        relations: [
            "reporter",
            "reporter.profile",
            "reportedUser",
            "reportedUser.profile",
            "reportedPost",
            "reportedPost.user",
            "reportedPost.user.profile",
            "reportedComment",
            "reportedComment.user",
            "reportedComment.user.profile",
            "resolvedBy",
            "resolvedBy.profile"
        ],
        order: { createdAt: "DESC" },
    });

    // Quitar contraseñas de las relaciones de usuario
    const safeReports = reports.map((report) => {
        const cleanUser = (u: any) => {
            if (!u) return null;
            const { password, ...safe } = u;
            return safe;
        };

        return {
            ...report,
            reporter: cleanUser(report.reporter),
            reportedUser: cleanUser(report.reportedUser),
            resolvedBy: cleanUser(report.resolvedBy),
            reportedPost: report.reportedPost ? {
                ...report.reportedPost,
                user: cleanUser(report.reportedPost.user),
            } : null,
            reportedComment: report.reportedComment ? {
                ...report.reportedComment,
                user: cleanUser(report.reportedComment.user),
            } : null,
        };
    });

    return sendResponse(res, safeReports, "Reportes obtenidos exitosamente");
});

// PATCH /admin/reports/:id/resolve
export const resolveReport = asyncHandler(async (req: AuthRequest, res: Response) => {
    const reportId = Number(req.params.id);
    const { status } = req.body; // "resolved" | "dismissed"

    if (!status || !["resolved", "dismissed"].includes(status)) {
        throw new AppError("Estado de resolución inválido", HttpStatus.BAD_REQUEST);
    }

    const report = await reportRepo.findOne({
        where: { id: reportId },
        relations: ["reporter"],
    });

    if (!report) {
        throw new AppError("Reporte no encontrado", HttpStatus.NOT_FOUND);
    }

    const resolver = await userRepo.findOne({ where: { id: req.user.id } });
    if (!resolver) {
        throw new AppError("Administrador/Moderador resolviendo no encontrado", HttpStatus.NOT_FOUND);
    }

    report.status = status;
    report.resolvedAt = new Date();
    report.resolvedBy = resolver;

    await reportRepo.save(report);

    return sendResponse(res, report, `Reporte marcado como ${status}`);
});

// DELETE /admin/posts/:id
export const deletePost = asyncHandler(async (req: AuthRequest, res: Response) => {
    const postId = Number(req.params.id);
    const post = await postRepo.findOne({ where: { id: postId } });

    if (!post) {
        throw new AppError("Publicación no encontrada", HttpStatus.NOT_FOUND);
    }

    // 1. Desvincular reportes de esta publicación
    const reports = await reportRepo.find({ where: { reportedPost: { id: postId } } });
    if (reports.length > 0) {
        for (const report of reports) {
            report.reportedPost = null;
        }
        await reportRepo.save(reports);
    }

    // 2. Desvincular reportes de los comentarios asociados a esta publicación
    const comments = await commentRepo.find({ where: { post: { id: postId } } });
    if (comments.length > 0) {
        const commentIds = comments.map(c => c.id);
        const { In } = require("typeorm");
        const commentReports = await reportRepo.find({
            where: { reportedComment: { id: In(commentIds) } }
        });
        if (commentReports.length > 0) {
            for (const r of commentReports) {
                r.reportedComment = null;
            }
            await reportRepo.save(commentReports);
        }
    }

    await postRepo.remove(post);

    return sendResponse(res, null, "Publicación eliminada por moderación");
});

// DELETE /admin/comments/:id
export const deleteComment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const commentId = Number(req.params.id);
    const comment = await commentRepo.findOne({ where: { id: commentId } });

    if (!comment) {
        throw new AppError("Comentario no encontrado", HttpStatus.NOT_FOUND);
    }

    // Desvincular reportes de este comentario
    const reports = await reportRepo.find({ where: { reportedComment: { id: commentId } } });
    if (reports.length > 0) {
        for (const report of reports) {
            report.reportedComment = null;
        }
        await reportRepo.save(reports);
    }

    await commentRepo.remove(comment);

    return sendResponse(res, null, "Comentario eliminado por moderación");
});

// POST /admin/users/:id/warn
export const sendWarning = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = Number(req.params.id);
    const { reason, postId } = req.body;

    const targetUser = await userRepo.findOne({ where: { id: userId }, relations: ["profile"] });
    if (!targetUser) {
        throw new AppError("Usuario no encontrado", HttpStatus.NOT_FOUND);
    }

    const sender = await userRepo.findOne({ where: { id: req.user.id } });
    if (!sender) {
        throw new AppError("Moderador no encontrado", HttpStatus.NOT_FOUND);
    }

    const notificationRepo = AppDataSource.getRepository(Notification);
    const warningMessage = reason 
        ? `Advertencia de moderación: ${reason}`
        : "Has recibido una advertencia por comportamiento inadecuado en la plataforma.";

    let post = null;
    if (postId) {
        post = await postRepo.findOne({ where: { id: Number(postId) } });
    }

    const notification = notificationRepo.create({
        type: "warning" as any,
        message: warningMessage,
        receiver: targetUser,
        sender: sender,
        post: post,
        isRead: false,
    });

    await notificationRepo.save(notification);

    if (targetUser.email) {
        const userLabel = targetUser.profile?.username || targetUser.email;
        sendWarningEmail(targetUser.email, userLabel, reason || "Infracción de normas");
    }

    return sendResponse(res, null, "Advertencia enviada exitosamente");
});
