import { apiAuth } from "./axios";

export interface ChatMessage {
    id: number;
    sender: "user" | "bot";
    content: string;
    createdAt: string;
}

export interface ChatConversation {
    id: number;
    title: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Recupera el historial de hilos de chat del estudiante
 */
export const getConversationsRequest = async (): Promise<ChatConversation[]> => {
    const res = await apiAuth.get("/chatbot/conversations");
    return res.data.data;
};

/**
 * Crea un nuevo hilo de chat
 */
export const createConversationRequest = async (title?: string): Promise<ChatConversation> => {
    const res = await apiAuth.post("/chatbot/conversations", { title });
    return res.data.data;
};

/**
 * Recupera el historial de mensajes de un hilo específico
 */
export const getConversationMessagesRequest = async (convId: number): Promise<ChatMessage[]> => {
    const res = await apiAuth.get(`/chatbot/conversations/${convId}/messages`);
    return res.data.data;
};

/**
 * Envía la consulta del estudiante al chatbot académico y recupera la respuesta inteligente
 */
export interface SendMessageResponse {
    conversationId: number;
    botMessage: string;
    flagged: boolean;
    type: "spam" | "offensive" | "harassment" | "inappropriate" | null;
    data: any;
}

export const sendMessageRequest = async (data: {
    content: string;
    conversationId?: number;
}): Promise<SendMessageResponse> => {
    const res = await apiAuth.post("/chatbot/message", data);
    return res.data.data;
};

/**
 * Recupera las recomendaciones cacheadas del estudiante
 */
export const getRecommendationsRequest = async () => {
    const res = await apiAuth.get("/chatbot/recommendations");
    return res.data.data;
};
