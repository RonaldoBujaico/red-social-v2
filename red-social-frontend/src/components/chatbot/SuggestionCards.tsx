import React from "react";
import { Compass, FileText, Search, Sparkles } from "lucide-react";

interface SuggestionCardsProps {
    onSelect: (text: string) => void;
}

export const SuggestionCards: React.FC<SuggestionCardsProps> = ({ onSelect }) => {
    const suggestions = [
        {
            icon: <Sparkles size={15} className="text-yellow-500 shrink-0" />,
            title: "Recomendaciones",
            description: "Alumnos y aportes de mi carrera",
            text: "Recomendar posts y estudiantes de mi especialidad",
        },
        {
            icon: <FileText size={15} className="text-blue-500 shrink-0" />,
            title: "Generar Publicación",
            description: "Crear borrador de convocatoria grupal",
            text: "Generar post: Necesito integrantes para mi proyecto final de Base de Datos",
        },
        {
            icon: <Search size={15} className="text-emerald-500 shrink-0" />,
            title: "Búsqueda Académica",
            description: "Buscar posts sobre un tema específico",
            text: "Buscar publicaciones sobre Base de Datos",
        },
        {
            icon: <Compass size={15} className="text-purple-500 shrink-0" />,
            title: "Guía de Soporte",
            description: "Aprende a usar la red social",
            text: "Ayuda sobre las opciones y funcionalidades de la plataforma",
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-2 mt-2">
            {suggestions.map((s, idx) => (
                <button
                    key={idx}
                    type="button"
                    onClick={() => onSelect(s.text)}
                    className="flex flex-col items-start text-left p-3 rounded-2xl border border-border bg-muted/40 hover:bg-muted/90 hover:border-yellow-500/30 transition-all cursor-pointer group"
                >
                    <div className="flex items-center gap-1.5 mb-1 w-full">
                        {s.icon}
                        <span className="text-[11px] font-bold text-foreground group-hover:text-yellow-500 transition-colors truncate">
                            {s.title}
                        </span>
                    </div>
                    <span className="text-[9px] text-muted-foreground leading-normal line-clamp-2">
                        {s.description}
                    </span>
                </button>
            ))}
        </div>
    );
};
