import { create } from "zustand";
import type { ChatMessage, ChatConversation } from "@/api/chatbot.api";

interface ChatbotState {
    messages: ChatMessage[];
    conversations: ChatConversation[];
    activeConversationId: number | null;
    isLoading: boolean;
    chatbotPayload: { type: string; posts?: any[]; students?: any[] } | null;

    setMessages: (messages: ChatMessage[]) => void;
    addMessage: (message: ChatMessage) => void;
    setConversations: (conversations: ChatConversation[]) => void;
    setActiveConversationId: (id: number | null) => void;
    setLoading: (isLoading: boolean) => void;
    setChatbotPayload: (payload: { type: string; posts?: any[]; students?: any[] } | null) => void;
    clearStore: () => void;
}

export const useChatbotStore = create<ChatbotState>((set) => ({
    messages: [],
    conversations: [],
    activeConversationId: null,
    isLoading: false,
    chatbotPayload: null,

    setMessages: (messages) => set({ messages }),
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    setConversations: (conversations) => set({ conversations }),
    setActiveConversationId: (activeConversationId) => set({ activeConversationId }),
    setLoading: (isLoading) => set({ isLoading }),
    setChatbotPayload: (chatbotPayload) => set({ chatbotPayload }),
    clearStore: () => set({
        messages: [],
        conversations: [],
        activeConversationId: null,
        isLoading: false,
        chatbotPayload: null,
    }),
}));
