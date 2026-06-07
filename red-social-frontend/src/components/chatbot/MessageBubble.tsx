import React from "react";
import type { ChatMessage } from "@/api/chatbot.api";

interface MessageBubbleProps {
    message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isBot = message.sender === "bot";

    // Formateador premium de Markdown integrado para estructurar respuestas académicas
    const formatText = (text: string) => {
        return text.split("\n").map((line, idx) => {
            let content: React.ReactNode = line;

            // Separador horizontal
            if (line.trim() === "---") {
                return <hr key={idx} className="border-border my-2.5 opacity-60" />;
            }

            // Títulos principales (ej: 📢 **TITULO** 📢)
            const titleMatch = line.match(/^📢\s*\*\*(.*?)\*\*\s*📢$/);
            if (titleMatch) {
                return (
                    <div key={idx} className="font-extrabold text-sm tracking-wide text-yellow-500 uppercase mt-2 mb-1.5 flex items-center gap-1.5">
                        <span>📢</span> {titleMatch[1]} <span>📢</span>
                    </div>
                );
            }

            // Subtítulos o secciones rápidas (ej: 📌 **Subtitulo**:)
            const sectionMatch = line.match(/^([📌📚👥🎯💻💡💎⚠️🔍✍️]*)\s*\*\*(.*?)\*\*:(.*)$/);
            if (sectionMatch) {
                const emoji = sectionMatch[1] ? sectionMatch[1].trim() : "";
                const boldTitle = sectionMatch[2].trim();
                const remainder = sectionMatch[3];
                
                // Formatear negritas dentro del resto de la línea
                const remainderParts = remainder.split("**");
                const formattedRemainder = remainderParts.map((part, pIdx) => {
                    return pIdx % 2 === 1 ? <strong key={pIdx} className="text-yellow-500 font-bold">{part}</strong> : part;
                });

                return (
                    <div key={idx} className="mt-3.5 mb-1 text-sm font-semibold flex items-start gap-1">
                        {emoji && <span className="shrink-0">{emoji}</span>}
                        <span className="text-yellow-500 shrink-0">{boldTitle}:</span>
                        <span className="font-normal text-muted-foreground ml-1">{formattedRemainder}</span>
                    </div>
                );
            }

            // Elementos de lista (viñetas * o -)
            if (line.trim().startsWith("*") || line.trim().startsWith("-")) {
                const clean = line.replace(/^[\*\-]\s*/, "");
                const boldParts = clean.split("**");
                const formattedLine = boldParts.map((part, pIdx) => {
                    return pIdx % 2 === 1 ? <strong key={pIdx} className="text-yellow-500 font-bold">{part}</strong> : part;
                });

                return (
                    <div key={idx} className="flex items-start gap-2.5 ml-4 my-1.5 text-xs text-muted-foreground">
                        <span className="text-yellow-500 text-[10px] mt-1 shrink-0">●</span>
                        <span className="leading-relaxed">{formattedLine}</span>
                    </div>
                );
            }

            // Citas en bloque (> texto)
            if (line.trim().startsWith(">")) {
                const quoteText = line.replace(/^>\s*/, "").replace(/"/g, "");
                return (
                    <blockquote key={idx} className="border-l-4 border-yellow-500/50 pl-3 py-1.5 my-2.5 bg-muted/40 rounded-r-xl italic text-xs text-muted-foreground">
                        "{quoteText}"
                    </blockquote>
                );
            }

            // Formatear negritas en líneas estándar
            const boldParts = line.split("**");
            if (boldParts.length > 1) {
                content = boldParts.map((part, pIdx) => {
                    return pIdx % 2 === 1 ? <strong key={pIdx} className="text-yellow-500 font-bold">{part}</strong> : part;
                });
            }

            return (
                <p key={idx} className="text-xs leading-relaxed my-1.5 whitespace-pre-wrap">
                    {content}
                </p>
            );
        });
    };

    return (
        <div className={`flex w-full ${isBot ? "justify-start" : "justify-end"} mb-4`}>
            <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md border transition-all duration-200 ${
                    isBot
                        ? "bg-muted/80 text-foreground border-border rounded-tl-none hover:bg-muted/95"
                        : "bg-yellow-500 text-black border-yellow-400 font-medium rounded-tr-none hover:bg-yellow-400"
                }`}
            >
                {formatText(message.content)}
                <div
                    className={`text-[8px] mt-1.5 text-right font-medium opacity-70 ${
                        isBot ? "text-muted-foreground" : "text-black/60"
                    }`}
                >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
            </div>
        </div>
    );
};
