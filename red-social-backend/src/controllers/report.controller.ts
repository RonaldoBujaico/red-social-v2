import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../errors/AppError";
import { HttpStatus } from "../utils/httpStatus";
import { sendResponse } from "../utils/response";
import { AppDataSource } from "../config/data-source";
import { Report } from "../entities/Report";
import { User } from "../entities/User";
import { Post } from "../entities/Post";
import { Comment } from "../entities/Comment";
import { AuthRequest } from "../types/authRequest";

const reportRepo = AppDataSource.getRepository(Report);
const userRepo = AppDataSource.getRepository(User);
const postRepo = AppDataSource.getRepository(Post);
const commentRepo = AppDataSource.getRepository(Comment);

export const create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { reason, description, reportedUserId, reportedPostId, reportedCommentId } = req.body;
    const reporterId = req.user.id;

    if (!reason) {
        throw new AppError("El motivo del reporte es obligatorio", HttpStatus.BAD_REQUEST);
    }

    if (!reportedUserId && !reportedPostId && !reportedCommentId) {
        throw new AppError(
            "Debes reportar un usuario, una publicación o un comentario",
            HttpStatus.BAD_REQUEST
        );
    }

    const reporter = await userRepo.findOne({ where: { id: reporterId } });
    if (!reporter) {
        throw new AppError("Usuario reportero no encontrado", HttpStatus.NOT_FOUND);
    }

    let reportedUserObj = null;
    let reportedPostObj = null;
    let reportedCommentObj = null;

    if (reportedUserId) {
        reportedUserObj = await userRepo.findOne({ where: { id: Number(reportedUserId) } });
        if (!reportedUserObj) {
            throw new AppError("El usuario reportado no existe", HttpStatus.NOT_FOUND);
        }
    }

    if (reportedPostId) {
        reportedPostObj = await postRepo.findOne({ where: { id: Number(reportedPostId) } });
        if (!reportedPostObj) {
            throw new AppError("La publicación reportada no existe", HttpStatus.NOT_FOUND);
        }
    }

    if (reportedCommentId) {
        reportedCommentObj = await commentRepo.findOne({ where: { id: Number(reportedCommentId) } });
        if (!reportedCommentObj) {
            throw new AppError("El comentario reportado no existe", HttpStatus.NOT_FOUND);
        }
    }

    const newReport = reportRepo.create({
        reporter,
        reason,
        description,
        status: "pending",
        reportedUser: reportedUserObj,
        reportedPost: reportedPostObj,
        reportedComment: reportedCommentObj,
    });

    await reportRepo.save(newReport);

    // Eliminar referencias circulares o sensibles para la respuesta
    const safeReport = {
        id: newReport.id,
        reason: newReport.reason,
        description: newReport.description,
        status: newReport.status,
        createdAt: newReport.createdAt,
    };

    return sendResponse(res, safeReport, "Reporte creado exitosamente", HttpStatus.CREATED);
});
