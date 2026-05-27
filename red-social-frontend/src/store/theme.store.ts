import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeState {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

function getInitialTheme(): Theme {
    const savedTheme = localStorage.getItem("theme") as Theme | null;

    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function applyTheme(theme: Theme) {
    const root = document.documentElement;

    if (theme === "dark") {
        root.classList.add("dark");
    } else {
        root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
}

export function initTheme() {
    applyTheme(initialTheme);
}
const initialTheme = getInitialTheme();

applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set) => ({
    theme: initialTheme,

    toggleTheme: () =>
        set((state) => {
            const newTheme: Theme = state.theme === "light" ? "dark" : "light";

            applyTheme(newTheme);

            return { theme: newTheme };
        }),

    setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
    },
}));
