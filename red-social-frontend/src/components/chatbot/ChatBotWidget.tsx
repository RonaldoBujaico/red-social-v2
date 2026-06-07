import React, { useState } from "react";
import { ChatWindow } from "./ChatWindow";
import { Sparkles, MessageSquare } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export const ChatBotWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <AnimatePresence>
                {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
            </AnimatePresence>

            <motion.button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                    y: [0, -6, 0],
                }}
                transition={{
                    y: {
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }
                }}
                className="fixed bottom-24 right-20 z-[997] md:bottom-6 md:right-24 w-14 h-14 rounded-2xl bg-yellow-500 text-black shadow-lg shadow-yellow-500/25 flex items-center justify-center cursor-pointer hover:bg-yellow-400 transition-colors border border-yellow-400"
                title="Asistente Académico Inteligente"
            >
                {isOpen ? (
                    <Sparkles size={23} className="fill-black/10" />
                ) : (
                    <MessageSquare size={22} className="fill-black/5" />
                )}
                {/* Micro-badge de IA premium */}
                <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-lg bg-black text-yellow-500 font-extrabold text-[7px] uppercase tracking-widest border border-yellow-500 shadow-md">
                    AI
                </span>
            </motion.button>
        </>
    );
};

export default ChatBotWidget;
