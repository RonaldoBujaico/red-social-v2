import { useQuery, useMutation } from "@tanstack/react-query";
import {
    getConversationsRequest,
    getConversationMessagesRequest,
    sendMessageRequest,
    createConversationRequest,
} from "@/api/chatbot.api";
import { useChatbotStore } from "@/store/chatbot.store";
import { useEffect } from "react";

export const useChatbot = () => {
    const {
        activeConversationId,
        setConversations,
        setMessages,
        addMessage,
        setLoading,
        setActiveConversationId,
        setChatbotPayload,
    } = useChatbotStore();

    // Query 1: Obtener la lista de conversaciones
    const { data: convData, refetch: refetchConversations } = useQuery({
        queryKey: ["chatbotConversations"],
        queryFn: getConversationsRequest,
    });

    useEffect(() => {
        if (convData) {
            setConversations(convData);
        }
    }, [convData, setConversations]);

    // Query 2: Obtener los mensajes del hilo activo
    const { data: msgData, refetch: refetchMessages } = useQuery({
        queryKey: ["chatbotMessages", activeConversationId],
        queryFn: () => getConversationMessagesRequest(activeConversationId!),
        enabled: !!activeConversationId,
    });

    useEffect(() => {
        if (msgData) {
            setMessages(msgData);
        }
    }, [msgData, setMessages]);

    // Mutation: Enviar Mensaje
    const sendMessageMutation = useMutation({
        mutationFn: sendMessageRequest,
        onMutate: () => {
            setLoading(true);
        },
        onSuccess: (data) => {
            // Recargar hilos
            refetchConversations();
            
            // Si el backend creó una conversación nueva para este mensaje
            if (data.conversationId && data.conversationId !== activeConversationId) {
                setActiveConversationId(data.conversationId);
            }

            // Registrar la respuesta del chatbot
            addMessage({
                id: Date.now(),
                sender: "bot",
                content: data.botMessage,
                createdAt: new Date().toISOString(),
            });

            // Registrar payload estructurado (recomendaciones o resultados de búsqueda)
            if (data.data && data.data.type) {
                setChatbotPayload({
                    type: data.data.type,
                    posts: data.data.posts || [],
                    students: data.data.students || [],
                });
            } else {
                setChatbotPayload(null);
            }

            // Recargar mensajes para asegurar sincronización exacta
            setTimeout(() => refetchMessages(), 200);
        },
        onError: (err: any) => {
            console.error("Error enviando mensaje al chatbot:", err);
            const apiError = err.response?.data?.message || "No se pudo comunicar con el servidor o superaste el límite de consultas. Por favor, intenta de nuevo más tarde.";
            
            addMessage({
                id: Date.now(),
                sender: "bot",
                content: `❌ **Error**: ${apiError}`,
                createdAt: new Date().toISOString(),
            });
        },
        onSettled: () => {
            setLoading(false);
        },
    });

    // Mutation: Crear nueva conversación
    const createConversationMutation = useMutation({
        mutationFn: createConversationRequest,
        onSuccess: (data) => {
            setActiveConversationId(data.id);
            setMessages([]);
            setChatbotPayload(null);
            refetchConversations();
        },
    });

    return {
        sendMessage: (content: string) => {
            if (!content.trim()) return;

            // Mostrar el mensaje del estudiante de inmediato (UX reactiva)
            addMessage({
                id: Date.now() - 1,
                sender: "user",
                content,
                createdAt: new Date().toISOString(),
            });

            sendMessageMutation.mutate({
                content,
                conversationId: activeConversationId || undefined,
            });
        },
        createConversation: (title?: string) => {
            createConversationMutation.mutate(title);
        },
        selectConversation: (id: number) => {
            setActiveConversationId(id);
            setChatbotPayload(null);
        },
        isSending: sendMessageMutation.isPending,
    };
};
