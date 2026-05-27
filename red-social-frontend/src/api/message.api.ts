import { apiAuth } from "./axios";

export const getConversationRequest = async (friendId: number) => {
    const { data } = await apiAuth.get(`/messages/conversation/${friendId}`);

    return data.data;
};

export const sendMessageRequest = async (
    receiverId: number,
    content: string,
) => {
    const { data } = await apiAuth.post(`/messages/${receiverId}`, {
        content,
    });

    return data.data;
};

export const markConversationAsReadRequest = async (friendId: number) => {
    const { data } = await apiAuth.patch(
        `/messages/conversation/${friendId}/read`,
    );

    return data.data;
};