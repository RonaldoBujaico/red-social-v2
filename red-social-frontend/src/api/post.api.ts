import { apiAuth } from "./axios";

export const createPostRequest = async (data: {
    content: string;
    image?: File | null;
}) => {
    const formData = new FormData();

    formData.append("content", data.content);

    if (data.image) {
        formData.append("image", data.image);
    }

    const res = await apiAuth.post("/posts", formData);

    return res.data.data;
};

export const getAllPostsRequest = async () => {
    const res = await apiAuth.get("/posts");
    console.log(res);
    return res.data.data;
};

export const deletePostRequest = async (id: number) => {
    const res = await apiAuth.delete(`/posts/${id}`);
    console.log(res);
    return res.data.data;
};

export const getMyPostsRequest = async () => {
    const res = await apiAuth.get("/posts/me");
    console.log(res);
    return res.data.data;
};

export const updatePostVisibilityRequest = async (
    id: number,
    visibility: "public" | "friends" | "private",
) => {
    const res = await apiAuth.patch(`/posts/${id}/visibility`, {
        visibility,
    });
    return res.data.data.data;
};
export const updatePostRequest = async (
    id: number,
    data: { content?: string },
) => {
    const res = await apiAuth.put(`/posts/${id}`, data);
    return res.data.data;
};

export const toggleLikePostRequest = async (postId: number) => {
    const res = await apiAuth.post(`/posts/${postId}/like`);
    return res.data.data;
};

export const createCommentRequest = async (
    postId: number,
    content: string,
) => {
    const res = await apiAuth.post(`/posts/${postId}/comments`, {
        content,
    });

    return res.data.data;
};
export const getPostsByUserIdRequest = async (userId: number) => {
    const res = await apiAuth.get(`/posts/user/${userId}`);
    return res.data.data;
};