import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { UserSettings } from "../entities/UserSettings";
import { AppError } from "../errors/AppError";
import { ErrorCode } from "../utils/errorCodes";
import { HttpStatus } from "../utils/httpStatus";

const userRepo = AppDataSource.getRepository(User);
const settingsRepo = AppDataSource.getRepository(UserSettings);

export const getMySettings = async (userId: number) => {
    let settings = await settingsRepo.findOne({
        where: {
            user: {
                id: userId,
            },
        },
        relations: ["user"],
    });

    if (!settings) {
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

        settings = settingsRepo.create({
            user,
            privateAccount: false,
            showOnlineStatus: true,
            emailNotifications: true,
            pushNotifications: true,
            likeNotifications: true,
            commentNotifications: true,
            friendRequestNotifications: true,
            theme: "dark",
        });

        await settingsRepo.save(settings);
    }

    return settings;
};

export const updateMySettings = async (
    userId: number,
    data: Partial<{
        privateAccount: boolean;
        showOnlineStatus: boolean;
        emailNotifications: boolean;
        pushNotifications: boolean;
        likeNotifications: boolean;
        commentNotifications: boolean;
        friendRequestNotifications: boolean;
        theme: "dark" | "light";
    }>,
) => {
    const settings = await getMySettings(userId);

    settings.privateAccount =
        data.privateAccount ?? settings.privateAccount;

    settings.showOnlineStatus =
        data.showOnlineStatus ?? settings.showOnlineStatus;

    settings.emailNotifications =
        data.emailNotifications ?? settings.emailNotifications;

    settings.pushNotifications =
        data.pushNotifications ?? settings.pushNotifications;

    settings.likeNotifications =
        data.likeNotifications ?? settings.likeNotifications;

    settings.commentNotifications =
        data.commentNotifications ?? settings.commentNotifications;

    settings.friendRequestNotifications =
        data.friendRequestNotifications ?? settings.friendRequestNotifications;

    settings.theme = data.theme ?? settings.theme;

    await settingsRepo.save(settings);

    return settings;
};