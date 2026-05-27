import { AppDataSource } from "../config/data-source";
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { FriendRequest } from "../entities/FriendRequest";
import { AppError } from "../errors/AppError";
import { HttpStatus } from "../utils/httpStatus";
import { ErrorCode } from "../utils/errorCodes";

const messageRepo = AppDataSource.getRepository(Message);
const userRepo = AppDataSource.getRepository(User);
const friendRequestRepo = AppDataSource.getRepository(FriendRequest);

const removePassword = (user: User) => {
    const safeUser = { ...user } as any;
    delete safeUser.password;
    return safeUser;
};

const checkAcceptedFriendship = async (userId: number, friendId: number) => {
    const friendship = await friendRequestRepo.findOne({
        where: [
            {
                sender: { id: userId },
                receiver: { id: friendId },
                status: "accepted",
            },
            {
                sender: { id: friendId },
                receiver: { id: userId },
                status: "accepted",
            },
        ],
        relations: ["sender", "receiver"],
    });

    return !!friendship;
};

export const sendMessage = async (
    senderId: number,
    receiverId: number,
    content: string,
) => {
    if (!content || !content.trim()) {
        throw new AppError(
            "El mensaje no puede estar vacío",
            HttpStatus.BAD_REQUEST,
        );
    }

    if (senderId === receiverId) {
        throw new AppError(
            "No puedes enviarte mensajes a ti mismo",
            HttpStatus.BAD_REQUEST,
        );
    }

    const sender = await userRepo.findOne({
        where: { id: senderId },
        relations: ["profile"],
    });

    if (!sender) {
        throw new AppError(
            "Usuario emisor no encontrado",
            HttpStatus.NOT_FOUND,
            ErrorCode.USER_NOT_FOUND,
        );
    }

    const receiver = await userRepo.findOne({
        where: { id: receiverId },
        relations: ["profile"],
    });

    if (!receiver) {
        throw new AppError(
            "Usuario receptor no encontrado",
            HttpStatus.NOT_FOUND,
            ErrorCode.USER_NOT_FOUND,
        );
    }

    const areFriends = await checkAcceptedFriendship(senderId, receiverId);

    if (!areFriends) {
        throw new AppError(
            "Solo puedes enviar mensajes a usuarios que aceptaron tu solicitud",
            HttpStatus.FORBIDDEN,
        );
    }

    const message = messageRepo.create({
        content: content.trim(),
        sender,
        receiver,
        isRead: false,
    });

    await messageRepo.save(message);

    return {
        ...message,
        sender: removePassword(sender),
        receiver: removePassword(receiver),
    };
};

export const getConversation = async (userId: number, friendId: number) => {
    const areFriends = await checkAcceptedFriendship(userId, friendId);

    if (!areFriends) {
        throw new AppError(
            "No puedes ver esta conversación",
            HttpStatus.FORBIDDEN,
        );
    }

    const messages = await messageRepo
        .createQueryBuilder("message")
        .leftJoinAndSelect("message.sender", "sender")
        .leftJoinAndSelect("sender.profile", "senderProfile")
        .leftJoinAndSelect("message.receiver", "receiver")
        .leftJoinAndSelect("receiver.profile", "receiverProfile")
        .where(
            "(sender.id = :userId AND receiver.id = :friendId) OR (sender.id = :friendId AND receiver.id = :userId)",
            {
                userId,
                friendId,
            },
        )
        .orderBy("message.createdAt", "ASC")
        .getMany();

    return messages.map((message) => ({
        ...message,
        sender: removePassword(message.sender),
        receiver: removePassword(message.receiver),
    }));
};

export const markConversationAsRead = async (
    userId: number,
    friendId: number,
) => {
    await messageRepo
        .createQueryBuilder()
        .update(Message)
        .set({
            isRead: true,
        })
        .where("receiverId = :userId", { userId })
        .andWhere("senderId = :friendId", { friendId })
        .execute();

    return { updated: true };
};