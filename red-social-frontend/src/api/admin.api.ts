import { apiAuth } from "./axios";

export const getAdminStatsRequest = async () => {
    const { data } = await apiAuth.get("/admin/stats");
    return data.data;
};

export const getAdminUsersRequest = async () => {
    const { data } = await apiAuth.get("/admin/users");
    return data.data;
};

export const getAdminReportsRequest = async () => {
    const { data } = await apiAuth.get("/admin/reports");
    return data.data;
};

export const getAdminPostsRequest = async () => {
    const { data } = await apiAuth.get("/admin/posts");
    return data.data;
};

export const toggleUserBanRequest = async (userId: number, isBanned: boolean) => {
    const { data } = await apiAuth.patch(`/admin/users/${userId}/ban`, { isBanned });
    return data.data;
};

export const updateUserRoleRequest = async (userId: number, role: string) => {
    const { data } = await apiAuth.patch(`/admin/users/${userId}/role`, { role });
    return data.data;
};

export const resolveReportRequest = async (reportId: number, status: "resolved" | "dismissed") => {
    const { data } = await apiAuth.patch(`/admin/reports/${reportId}/resolve`, { status });
    return data.data;
};

export const adminDeletePostRequest = async (postId: number) => {
    const { data } = await apiAuth.delete(`/admin/posts/${postId}`);
    return data.data;
};

export const adminDeleteCommentRequest = async (commentId: number) => {
    const { data } = await apiAuth.delete(`/admin/comments/${commentId}`);
    return data.data;
};

export const sendUserWarningRequest = async (userId: number, body: { reason: string; postId?: number | null; commentId?: number | null }) => {
    const { data } = await apiAuth.post(`/admin/users/${userId}/warn`, body);
    return data.data;
};
