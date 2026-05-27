import { AppDataSource } from "../config/data-source";
import { Notification } from "../entities/Notification";

const notificationRepo = AppDataSource.getRepository(Notification);

export const getMyNotifications = async (userId: number) => {
    return await notificationRepo.find({
        where: {
            receiver: {
                id: userId,
            },
        },
        relations: [
            "sender",
            "sender.profile",
            "receiver",
            "receiver.profile",
            "post",
        ],
        order: {
            createdAt: "DESC",
        },
    });
};

export const markAllAsRead = async (userId: number) => {
    await notificationRepo.update(
        {
            receiver: {
                id: userId,
            },
            isRead: false,
        },
        {
            isRead: true,
        },
    );

    return { updated: true };
};