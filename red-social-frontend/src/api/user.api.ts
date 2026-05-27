import { apiAuth } from "./axios";

export const updateAvatarRequest = async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const { data } = await apiAuth.patch("/users/profile/avatar", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return data.data;
};

export const updateCoverImageRequest = async (file: File) => {
    const formData = new FormData();
    formData.append("coverImage", file);

    const { data } = await apiAuth.patch("/users/profile/cover", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return data.data;
};

export const searchUsersRequest = async (query: string) => {
    const { data } = await apiAuth.get("/users/search", {
        params: {
            q: query,
        },
    });

    return data.data;
};

export const getUserByIdRequest = async (id: number) => {
    const { data } = await apiAuth.get(`/users/${id}`);

    return data.data;
};

export const sendFriendRequestRequest = async (userId: number) => {
    const { data } = await apiAuth.post(`/users/${userId}/friend-request`);

    return data.data;
};

export const getReceivedFriendRequestsRequest = async () => {
    const { data } = await apiAuth.get("/users/friend-requests/received");

    return data.data;
};

export const respondFriendRequestRequest = async (
    requestId: number,
    status: "accepted" | "rejected",
) => {
    const { data } = await apiAuth.patch(
        `/users/friend-requests/${requestId}/respond`,
        {
            status,
        },
    );

    return data.data;
};
export const getAcceptedFriendsRequest = async () => {
    const { data } = await apiAuth.get("/users/friends/accepted");
    return data.data;
};

export const updateUserRequest = async (
    id: number,
    data: {
        firstName?: string;
        lastName?: string;
        username?: string;
        email?: string;
        bio?: string;
        birthDate?: string;
        gender?: "male" | "female" | "other";
        career?: string;
        cycle?: string;
        phone?: string;
        hobbies?: string;
    },
) => {
    const res = await apiAuth.put(`/users/${id}`, data);

    return res.data.data;
};
export const getSuggestedUsersRequest = async () => {
    const { data } = await apiAuth.get("/users/suggestions");
    return data.data;
};