import { apiAuth } from "./axios";

export type UserSettings = {
    id?: number;
    privateAccount: boolean;
    showOnlineStatus: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    likeNotifications: boolean;
    commentNotifications: boolean;
    friendRequestNotifications: boolean;
    theme: "dark" | "light";
};

export const getMySettingsRequest = async () => {
    const { data } = await apiAuth.get("/user-settings");

    return data.data;
};

export const updateMySettingsRequest = async (
    settings: Partial<UserSettings>,
) => {
    const { data } = await apiAuth.patch("/user-settings", settings);

    return data.data;
};