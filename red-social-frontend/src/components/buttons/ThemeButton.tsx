import { useThemeStore } from "@/store/theme.store";
import { useAuthStore } from "@/store/auth.store";
import { updateMySettingsRequest } from "@/api/settings.api";
import { Sun, Moon } from "lucide-react";
import { useState } from "react";

export default function ThemeButton() {
    const toggleTheme = useThemeStore((s) => s.toggleTheme);
    const theme = useThemeStore((s) => s.theme);
    const user = useAuthStore((s) => s.user);
    const [updating, setUpdating] = useState(false);

    const handleToggle = async () => {
        if (updating) return;

        const nextTheme = theme === "light" ? "dark" : "light";
        toggleTheme();

        if (user) {
            try {
                setUpdating(true);
                await updateMySettingsRequest({ theme: nextTheme });
            } catch (err) {
                console.error("No se pudo sincronizar el tema con el servidor:", err);
            } finally {
                setUpdating(false);
            }
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={updating}
            title={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
            className="
                group relative w-14 h-14 rounded-full flex items-center justify-center
                bg-card border border-border
                shadow-xl shadow-black/20
                hover:shadow-2xl hover:shadow-yellow-500/20
                hover:border-yellow-500/40
                hover:scale-110
                active:scale-95
                disabled:opacity-70
                transition-all duration-300 ease-out
                overflow-hidden
                cursor-pointer
            "
        >
            {/* Glow ring on hover */}
            <span className="
                absolute inset-0 rounded-full opacity-0 group-hover:opacity-100
                bg-gradient-to-br from-yellow-400/10 to-yellow-600/5
                transition-opacity duration-300
            " />

            {/* Animated icons */}
            <span className="relative w-6 h-6 flex items-center justify-center">
                <Sun
                    size={22}
                    className={`
                        absolute text-yellow-400 transition-all duration-500 ease-out
                        ${theme === "dark"
                            ? "rotate-0 scale-100 opacity-100"
                            : "rotate-90 scale-0 opacity-0"
                        }
                    `}
                />
                <Moon
                    size={22}
                    className={`
                        absolute text-blue-300 transition-all duration-500 ease-out
                        ${theme === "light"
                            ? "rotate-0 scale-100 opacity-100"
                            : "-rotate-90 scale-0 opacity-0"
                        }
                    `}
                />
            </span>
        </button>
    );
}
