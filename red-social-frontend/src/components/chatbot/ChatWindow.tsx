import React, { useRef, useEffect, useState } from "react";
import { useChatbot } from "@/hooks/useChatbot";
import { useChatbotStore } from "@/store/chatbot.store";
import { MessageBubble } from "./MessageBubble";
import { SuggestionCards } from "./SuggestionCards";
import { RecommendedPosts } from "./RecommendedPosts";
import { RecommendedUsers } from "./RecommendedUsers";
import { SearchedUsers } from "./SearchedUsers";
import { X, Send, Plus, MessageSquare, Loader2, Sparkles, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatWindowProps {
    onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
    const {
        messages,
        conversations,
        activeConversationId,
        isLoading,
        chatbotPayload,
    } = useChatbotStore();

    const { sendMessage, createConversation, selectConversation, isSending } = useChatbot();
    const [inputValue, setInputValue] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll a la base al añadir nuevos mensajes
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Inicializar conversación si no hay ninguna seleccionada
    useEffect(() => {
        if (!activeConversationId && conversations.length > 0) {
            selectConversation(conversations[0].id);
        }
    }, [conversations, activeConversationId, selectConversation]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isSending) return;
        sendMessage(inputValue);
        setInputValue("");
    };

    const handleQuickAction = (text: string) => {
        if (isSending) return;
        sendMessage(text);
    };

    const activeConvTitle = conversations.find(c => c.id === activeConversationId)?.title || "Consulta Académica";

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 md:right-6 z-[999] w-[92vw] sm:w-[440px] h-[600px] max-h-[82vh] bg-background border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col"
        >
            {/* ── HEADER ── */}
            <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20">
                        <Sparkles size={16} className="text-black fill-black/10" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-extrabold text-foreground truncate max-w-[190px]">
                            Asistente Inteligente
                        </h3>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[190px]">
                            {activeConvTitle}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {/* Botón de Historial */}
                    <button
                        type="button"
                        onClick={() => setShowHistory(!showHistory)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                            showHistory 
                                ? "bg-yellow-500 text-black shadow-md shadow-yellow-500/10" 
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                        title="Historial de consultas"
                    >
                        <History size={16} />
                    </button>

                    {/* Botón Nueva Conversación */}
                    <button
                        type="button"
                        onClick={() => {
                            createConversation("Consulta " + new Date().toLocaleDateString());
                            setShowHistory(false);
                        }}
                        className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
                        title="Nueva consulta"
                    >
                        <Plus size={16} />
                    </button>

                    {/* Cerrar */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer ml-1"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* ── CUERPO PRINCIPAL (CON HISTORIAL DESLIZABLE) ── */}
            <div className="flex-1 overflow-hidden relative flex">
                
                {/* ── PANEL LATERAL DE HISTORIAL (SIDEBAR) ── */}
                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ x: -260 }}
                            animate={{ x: 0 }}
                            exit={{ x: -260 }}
                            transition={{ type: "tween", duration: 0.2 }}
                            className="absolute inset-y-0 left-0 w-60 border-r border-border bg-background z-30 p-4 flex flex-col justify-between shadow-lg"
                        >
                            <div className="flex-1 overflow-y-auto">
                                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <MessageSquare size={12} />
                                    Mis Consultas
                                </h4>
                                {conversations.length === 0 ? (
                                    <p className="text-[10px] text-muted-foreground mt-4 text-center">
                                        No hay consultas previas.
                                    </p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {conversations.map((c) => {
                                            const isActive = c.id === activeConversationId;
                                            return (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => {
                                                        selectConversation(c.id);
                                                        setShowHistory(false);
                                                    }}
                                                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all cursor-pointer truncate ${
                                                        isActive
                                                            ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 font-bold"
                                                            : "border border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    }`}
                                                >
                                                    {c.title}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            <div className="pt-3 border-t border-border mt-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        createConversation("Consulta " + new Date().toLocaleDateString());
                                        setShowHistory(false);
                                    }}
                                    className="w-full py-2 px-3 rounded-xl bg-yellow-500 text-black text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-yellow-500/20 hover:bg-yellow-400 transition cursor-pointer"
                                >
                                    <Plus size={14} />
                                    Nueva Consulta
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── CHAT CONTROLLER Y MENSAJES ── */}
                <div 
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto p-4 flex flex-col"
                >
                    {messages.length === 0 && !isLoading ? (
                        /* Mensaje de bienvenida inicial */
                        <div className="flex-1 flex flex-col justify-center items-center text-center px-4 max-w-sm mx-auto">
                            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-4">
                                <Sparkles size={24} className="text-yellow-500" />
                            </div>
                            <h4 className="text-sm font-black text-foreground">
                                Asistente Académico Inteligente
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                                Estoy listo para ayudarte a buscar apuntes, conectar con compañeros, generar publicaciones formales o resolver tus dudas de UniConnect.
                            </p>
                            <div className="w-full mt-6">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 text-left">
                                    Sugerencias rápidas
                                </p>
                                <SuggestionCards onSelect={handleQuickAction} />
                            </div>
                        </div>
                    ) : (
                        /* Historial de Mensajes */
                        <div className="flex-1 flex flex-col justify-end min-h-full">
                            {messages.map((msg) => (
                                <MessageBubble key={msg.id} message={msg} />
                            ))}

                            {/* Cargador interactivo (Buscando/Typing) */}
                            {isLoading && (
                                <div className="flex justify-start mb-4">
                                    <div className="bg-muted/80 border border-border text-foreground px-4 py-3.5 rounded-2xl rounded-tl-none flex items-center gap-2.5 shadow-sm">
                                        <Loader2 size={14} className="animate-spin text-yellow-500" />
                                        <span className="text-[11px] font-semibold text-muted-foreground">
                                            Procesando consulta académica...
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Mostrar Paneles de Resultados/Recomendaciones */}
                            {chatbotPayload && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {chatbotPayload.type === "search_users_results" && chatbotPayload.students && (
                                        <SearchedUsers students={chatbotPayload.students} />
                                    )}
                                    {chatbotPayload.type === "recommendations" && chatbotPayload.students && (
                                        <RecommendedUsers students={chatbotPayload.students} />
                                    )}
                                    {chatbotPayload.posts && chatbotPayload.posts.length > 0 && (
                                        <RecommendedPosts posts={chatbotPayload.posts} />
                                    )}
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* ── CAJA DE TEXTO (INPUT BAR) ── */}
            <form
                onSubmit={handleSend}
                className="px-4 py-3 border-t border-border bg-background flex items-center gap-2"
            >
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Pregúntame algo académico..."
                    disabled={isSending}
                    className="flex-1 bg-muted/60 border border-border focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 rounded-2xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={!inputValue.trim() || isSending}
                    className="p-2.5 rounded-2xl bg-yellow-500 text-black hover:bg-yellow-400 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed shadow-md shadow-yellow-500/10 hover:shadow-yellow-500/20 transition-all cursor-pointer shrink-0"
                >
                    {isSending ? (
                        <Loader2 size={15} className="animate-spin" />
                    ) : (
                        <Send size={15} />
                    )}
                </button>
            </form>
        </motion.div>
    );
};
