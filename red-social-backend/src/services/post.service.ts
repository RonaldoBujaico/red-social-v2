import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { Post } from "../entities/Post";
import { AppError } from "../errors/AppError";
import { ErrorCode } from "../utils/errorCodes";
import { HttpStatus } from "../utils/httpStatus";
import { CreatePostDto, UpdatePostDto } from "../dtos/post.dto";
import { Reaction } from "../entities/Reaction";
import { Comment } from "../entities/Comment";
import { Notification } from "../entities/Notification";
import { In } from "typeorm";
import { Report } from "../entities/Report";


const postRepo = AppDataSource.getRepository(Post);
const userRepo = AppDataSource.getRepository(User);
const reactionRepo = AppDataSource.getRepository(Reaction);
const commentRepo = AppDataSource.getRepository(Comment);
const notificationRepo = AppDataSource.getRepository(Notification);

export const createPost = async (userId: number, data: CreatePostDto) => {
    const user = await userRepo.findOne({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError(
            "Usuario no encontrado",
            HttpStatus.NOT_FOUND,
            ErrorCode.USER_NOT_FOUND,
        );
    }
    const fecha = new Date();

    console.log("TIPO:", typeof fecha); // debe ser object
    console.log("VALIDA:", isNaN(fecha.getTime())); // debe ser false

    const post = postRepo.create({
        content: data.content,
        visibility: data.visibility || "public",
        createdAt: fecha,
        imageUrl: data.imageUrl ?? null,
        user,
    });

    await postRepo.save(post);

    return post;
};

export const getPosts = async () => {
    return await postRepo.find({
        relations: [
            "user",
            "user.profile",
            "comments",
            "comments.user",
            "comments.user.profile",
            "reactions",
        ],
        order: { createdAt: "DESC" },
    });
};

export const getPostById = async (id: number) => {
    const post = await postRepo.findOne({
        where: { id },
        relations: [
            "user",
            "user.profile",
            "comments",
            "comments.user",
            "comments.user.profile",
            "reactions",
        ],
    });

    if (!post) {
        throw new AppError(
            "Post no encontrado",
            HttpStatus.NOT_FOUND,
            ErrorCode.NOT_FOUND,
        );
    }

    return post;
};

export const updatePost = async (
    userId: number,
    postId: number,
    data: UpdatePostDto
) => {
    const post = await postRepo.findOne({
        where: { id: postId },
        relations: ["user"],
    });

    if (!post) {
        throw new AppError("Post no encontrado", HttpStatus.NOT_FOUND);
    }

    if (post.user.id !== userId) {
        throw new AppError("No autorizado", HttpStatus.FORBIDDEN);
    }

    // 🔥 validación extra (pro)
    if (!data.content && !data.visibility) {
        throw new AppError("Nada para actualizar", HttpStatus.BAD_REQUEST);
    }

    post.content = data.content ?? post.content;
    post.visibility = data.visibility ?? post.visibility;

    await postRepo.save(post);

    return post;
};
// ✅ DELETE
export const deletePost = async (userId: number, postId: number) => {
    const post = await postRepo.findOne({
        where: { id: postId },
        relations: ["user"],
    });

    if (!post) {
        throw new AppError("Post no encontrado", HttpStatus.NOT_FOUND);
    }

    if (post.user.id !== userId) {
        throw new AppError("No autorizado", HttpStatus.FORBIDDEN);
    }

    const reportRepo = AppDataSource.getRepository(Report);

    // 1. Limpiar reportes directos del post
    const postReports = await reportRepo.find({ where: { reportedPost: { id: postId } } });
    if (postReports.length > 0) {
        for (const r of postReports) {
            r.reportedPost = null;
        }
        await reportRepo.save(postReports);
    }

    // 2. Limpiar reportes de comentarios asociados al post
    const comments = await commentRepo.find({ where: { post: { id: postId } } });
    if (comments.length > 0) {
        const commentIds = comments.map(c => c.id);
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

    return { deleted: true };
};

export const getMyPosts = async (userId: number) => {
    const posts = await postRepo.find({
        where: { user: { id: userId } },
        order: { createdAt: "DESC" },
        relations: [
            "user",
            "user.profile",
            "comments",
            "comments.user",
            "comments.user.profile",
            "reactions",
        ],
    });

    return posts;
};

export const updatePostVisibility = async (
    postId: number,
    userId: number,
    visibility: "public" | "friends" | "private",
) => {
    const post = await postRepo.findOne({
        where: { id: postId },
        relations: ["user"],
    });

    if (!post) {
        throw new AppError("Post no encontrado", HttpStatus.NOT_FOUND);
    }

    if (post.user.id !== userId) {
        throw new AppError("No autorizado", HttpStatus.FORBIDDEN);
    }

    post.visibility = visibility;

    await postRepo.save(post);

    return post;
};

export const toggleLikePost = async (postId: number, userId: number) => {
    const post = await postRepo.findOne({
        where: { id: postId },
        relations: ["user", "user.profile"],
    });

    if (!post) {
        throw new AppError("Post no encontrado", HttpStatus.NOT_FOUND);
    }

    const user = await userRepo.findOne({
        where: { id: userId },
        relations: ["profile"],
    });

    if (!user) {
        throw new AppError(
            "Usuario no encontrado",
            HttpStatus.NOT_FOUND,
            ErrorCode.USER_NOT_FOUND,
        );
    }

    const existingReaction = await reactionRepo.findOne({
        where: {
            post: { id: postId },
            user: { id: userId },
        },
        relations: ["post", "user"],
    });

    if (existingReaction) {
        await reactionRepo.remove(existingReaction);

        const updatedPost = await getPostById(postId);

        return {
            liked: false,
            post: updatedPost,
        };
    }

    const reaction = reactionRepo.create({
        type: "like",
        post,
        user,
    });

    await reactionRepo.save(reaction);

    if (post.user.id !== userId) {
        const senderName =
            user.profile?.username ||
            `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() ||
            "Usuario";

        const notification = notificationRepo.create({
            type: "like",
            message: `${senderName} le dio Me gusta a tu publicación.`,
            receiver: post.user,
            sender: user,
            post,
            isRead: false,
        });

        await notificationRepo.save(notification);
    }

    const updatedPost = await getPostById(postId);

    return {
        liked: true,
        post: updatedPost,
    };
};

export const createComment = async (
    postId: number,
    userId: number,
    content: string,
) => {
    if (!content || !content.trim()) {
        throw new AppError(
            "El comentario no puede estar vacío",
            HttpStatus.BAD_REQUEST,
        );
    }

    const post = await postRepo.findOne({
        where: { id: postId },
        relations: ["user", "user.profile"],
    });

    if (!post) {
        throw new AppError("Post no encontrado", HttpStatus.NOT_FOUND);
    }

    const user = await userRepo.findOne({
        where: { id: userId },
        relations: ["profile"],
    });

    if (!user) {
        throw new AppError(
            "Usuario no encontrado",
            HttpStatus.NOT_FOUND,
            ErrorCode.USER_NOT_FOUND,
        );
    }

    const comment = commentRepo.create({
        content: content.trim(),
        post,
        user,
    });

    await commentRepo.save(comment);

    if (post.user.id !== userId) {
        const senderName =
            user.profile?.username ||
            `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() ||
            "Usuario";

        const notification = notificationRepo.create({
            type: "comment",
            message: `${senderName} comentó tu publicación.`,
            receiver: post.user,
            sender: user,
            post,
            isRead: false,
        });

        await notificationRepo.save(notification);
    }

    const updatedPost = await getPostById(postId);

    return updatedPost;
};
export const getPostsByUserId = async (userId: number) => {
    const posts = await postRepo.find({
        where: {
            user: {
                id: userId,
            },
        },
        order: {
            createdAt: "DESC",
        },
        relations: [
            "user",
            "user.profile",
            "comments",
            "comments.user",
            "comments.user.profile",
            "reactions",
        ],
    });

    return posts;
};