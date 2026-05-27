import { apiAuth } from "./axios";

interface CreateReportData {
    reason: string;
    description?: string;
    reportedUserId?: number;
    reportedPostId?: number;
    reportedCommentId?: number;
}

export const createReportRequest = async (reportData: CreateReportData) => {
    const { data } = await apiAuth.post("/reports", reportData);
    return data.data;
};
