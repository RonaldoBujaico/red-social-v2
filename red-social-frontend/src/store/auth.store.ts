// src/store/auth.store.ts
import { create } from "zustand";
import type { User } from "@/types/auth";
import { loginRequest, logoutRequest } from "@/api/auth.api";

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;

    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUserProfile: (profileData: Partial<User["profile"]>) => void;
}

interface LocalStorageState {
    accessToken: string;
    isNewDevice?: boolean;
    refreshToken: string;
    user: User;
}

let initial: LocalStorageState | null = null;

try {
    const stored = localStorage.getItem("auth");

    if (stored) {
        initial = JSON.parse(stored);
    }
} catch {
    localStorage.removeItem("auth");
}

const saveAuthToLocalStorage = (
    user: User | null,
    accessToken: string | null,
    refreshToken: string | null,
) => {
    if (!user || !accessToken || !refreshToken) {
        localStorage.removeItem("auth");
        return;
    }

    localStorage.setItem(
        "auth",
        JSON.stringify({
            user,
            accessToken,
            refreshToken,
        }),
    );
};

export const useAuthStore = create<AuthState>((set, get) => ({
    user: initial?.user || null,
    accessToken: initial?.accessToken || null,
    refreshToken: initial?.refreshToken || null,

    login: async (email, password) => {
        try {
            const data = await loginRequest({ email, password });

            set({
                user: data.user,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });

            saveAuthToLocalStorage(
                data.user,
                data.accessToken,
                data.refreshToken,
            );
        } catch (error: any) {
            throw error.response?.data || error;
        }
    },

    logout: async () => {
        try {
            const refreshToken = get().refreshToken;

            if (refreshToken) {
                await logoutRequest(refreshToken);
            }
        } catch (error) {
            console.warn("Error logout backend (no crítico)");
        } finally {
            set({
                user: null,
                accessToken: null,
                refreshToken: null,
            });

            localStorage.removeItem("auth");
        }
    },

    updateUserProfile: (profileData) => {
        const { user, accessToken, refreshToken } = get();

        if (!user) return;

        const updatedUser: User = {
            ...user,
            profile: {
                ...user.profile,
                ...profileData,
            },
        };

        set({
            user: updatedUser,
        });

        saveAuthToLocalStorage(updatedUser, accessToken, refreshToken);
    },
}));