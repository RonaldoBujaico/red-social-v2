import { apiAuth } from "./axios";

export const getMyNotificationsRequest = async () => {
    const { data } = await apiAuth.get("/notifications");

    return data.data;
};

export const markAllNotificationsAsReadRequest = async () => {
    const { data } = await apiAuth.patch("/notifications/read-all");

    return data.data;
};