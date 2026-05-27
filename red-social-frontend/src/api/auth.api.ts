import type { AuthResponse } from "@/types/auth";
import { api, apiAuth } from "./axios";

export const loginRequest = async (data: {
    email: string;
    password: string;
}): Promise<AuthResponse> => {
    const res = await api.post("/auth/login", data);
    return res.data.data;
};

export const logoutRequest = (refreshToken: string) => {
    return apiAuth.post("/auth/logout", {
        refreshToken,
    });
};

export const createPostRequest = async (data: {
    content: string;
    image?: File | null;
}) => {
    const formData = new FormData();

    formData.append("content", data.content);

    if (data.image) {
        formData.append("image", data.image);
    }

    const res = await apiAuth.post("/posts", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data.data;
};


export const changePasswordRequest = async (data: {
    currentPassword: string;
    newPassword: string;
}) => {
    const res = await apiAuth.patch("/auth/change-password", data);

    return res.data.data;
};