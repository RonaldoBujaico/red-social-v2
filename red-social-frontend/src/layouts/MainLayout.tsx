import ThemeButton from "@/components/buttons/ThemeButton";
import { NavLink, Outlet } from "react-router-dom";
import LogoutButton from "../components/buttons/LogoutButton";
import ChatBotWidget from "@/components/chatbot/ChatBotWidget";
import {
    House,
    Compass,
    MessageCircle,
    Bell,
    User,
    Settings,
    BookCheck,
    ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useEffect, useState } from "react";
import { getReceivedFriendRequestsRequest } from "@/api/user.api";
import { getMyNotificationsRequest } from "@/api/notification.api";
import UserSearch from "@/components/search/UserSearch";
import RightSidebar from "@/components/layout/RightSidebar";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function getAvatarUrl(avatar?: string | null, name?: string) {
    if (!avatar) {
        const n = encodeURIComponent(name || "U");
        return `https://ui-avatars.com/api/?name=${n}&background=f5b800&color=000&bold=true`;
    }
    if (avatar.startsWith("http")) return avatar;
    return `${BACKEND_URL}${avatar}`;
}

export default function MainLayout() {
    const { user } = useAuthStore();
    const [notificationCount, setNotificationCount] = useState(0);

    const fullName =
        `${user?.profile?.firstName || ""} ${user?.profile?.lastName || ""}`.trim() ||
        "Estudiante";

    const username = user?.profile?.username || "usuario";
    const avatarUrl = getAvatarUrl(user?.profile?.avatar, fullName);

    const fetchNotificationCount = async () => {
        try {
            const [friendRequests, notifications] = await Promise.all([
                getReceivedFriendRequestsRequest(),
                getMyNotificationsRequest(),
            ]);

            const unreadNotifications = notifications.filter(
                (notification: any) => !notification.isRead,
            ).length;

            const pendingRequests = friendRequests.length;

            setNotificationCount(unreadNotifications + pendingRequests);
        } catch (error) {
            console.error("Error cargando contador de notificaciones", error);
        }
    };

    useEffect(() => {
        fetchNotificationCount();

        const interval = setInterval(() => {
            fetchNotificationCount();
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    const notificationLabel =
        notificationCount > 9 ? "9+" : String(notificationCount);

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* ── Sidebar Desktop (hidden on mobile) ── */}
            <aside className="hidden md:flex w-64 lg:w-72 xl:w-80 h-screen sticky top-0 border-r border-border flex-col justify-between overflow-hidden shrink-0">
                
                {/* Top section */}
                <div className="p-5 flex flex-col gap-6">
                    {/* Logo */}
                    <NavLink
                        to="/home"
                        className="flex items-center gap-2.5 group"
                    >
                        <div className="w-9 h-9 rounded-xl bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:shadow-yellow-500/40 transition-all">
                            <span className="text-black font-black text-sm">U</span>
                        </div>
                        <span className="text-xl font-extrabold tracking-tight group-hover:text-yellow-400 transition">
                            UniConnect
                        </span>
                    </NavLink>

                    {/* User card */}
                    <NavLink
                        to="/profile"
                        className="flex items-center gap-3 p-3 rounded-2xl bg-muted/60 border border-border hover:border-yellow-500/30 hover:bg-muted transition-all group"
                    >
                        <img
                            src={avatarUrl}
                            alt={fullName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-border group-hover:border-yellow-500/50 transition"
                        />
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate leading-none">
                                {fullName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                @{username}
                            </p>
                        </div>
                    </NavLink>

                    {/* Navigation */}
                    <nav className="space-y-1">
                        {[
                            { to: "/home", icon: <House size={19} />, label: "Inicio" },
                            { to: "/my-posts", icon: <BookCheck size={19} />, label: "Mis Publicaciones" },
                            { to: "/explore", icon: <Compass size={19} />, label: "Explorar" },
                            { to: "/messages", icon: <MessageCircle size={19} />, label: "Mensajes" },
                        ].map(({ to, icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                                        isActive
                                            ? "bg-yellow-500 text-black shadow-md shadow-yellow-500/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`
                                }
                            >
                                {icon}
                                {label}
                            </NavLink>
                        ))}

                        {/* Notifications with badge */}
                        <NavLink
                            to="/notifications"
                            onClick={() => setTimeout(fetchNotificationCount, 500)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                                    isActive
                                        ? "bg-yellow-500 text-black shadow-md shadow-yellow-500/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`
                            }
                        >
                            <div className="relative">
                                <Bell size={19} />
                                {notificationCount > 0 && (
                                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-background">
                                        {notificationLabel}
                                    </span>
                                )}
                            </div>
                            Notificaciones
                        </NavLink>

                        {[
                            { to: "/profile", icon: <User size={19} />, label: "Perfil" },
                            { to: "/settings", icon: <Settings size={19} />, label: "Ajustes" },
                        ].map(({ to, icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                                        isActive
                                            ? "bg-yellow-500 text-black shadow-md shadow-yellow-500/20"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    }`
                                }
                            >
                                {icon}
                                {label}
                            </NavLink>
                        ))}

                        {user && (user.role === "admin" || user.role === "moderator") && (
                            <NavLink
                                to="/admin"
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium mt-2 ${
                                        isActive
                                            ? "bg-yellow-500 text-black shadow-md"
                                            : "text-yellow-500 hover:bg-yellow-500/10 border border-yellow-500/20"
                                    }`
                                }
                            >
                                <ShieldCheck size={19} />
                                Panel Admin
                            </NavLink>
                        )}
                    </nav>
                </div>

                {/* Bottom: logout */}
                <div className="p-5 border-t border-border">
                    <LogoutButton />
                </div>
            </aside>

            {/* ── Main content ── */}
            <main className="flex-1 min-h-screen bg-background text-foreground pb-20 md:pb-0">
                <div className="sticky top-0 z-40 px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border">
                    <UserSearch />
                </div>
                <div className="p-3 sm:p-4 md:p-6">
                    <Outlet />
                </div>
            </main>

            {/* ── Right sidebar (hidden on mobile/tablet) ── */}
            <div className="hidden xl:block">
                <RightSidebar />
            </div>

            {/* ── Chatbot floating widget ── */}
            <ChatBotWidget />

            {/* ── Theme toggle floating button (desktop only, higher on mobile due to bottom nav) ── */}
            <div className="fixed bottom-24 right-4 z-[998] md:bottom-6 md:right-6">
                <ThemeButton />
            </div>

            {/* ── Mobile Bottom Navigation Bar ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[999] bg-background/95 backdrop-blur-md border-t border-border flex items-center justify-around px-2 py-2 safe-area-bottom">
                {[
                    { to: "/home", icon: <House size={22} />, label: "Inicio" },
                    { to: "/explore", icon: <Compass size={22} />, label: "Explorar" },
                    { to: "/notifications", icon: (
                        <div className="relative">
                            <Bell size={22} />
                            {notificationCount > 0 && (
                                <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center border border-background">
                                    {notificationCount > 9 ? "9+" : notificationCount}
                                </span>
                            )}
                        </div>
                    ), label: "Alertas" },
                    { to: "/messages", icon: <MessageCircle size={22} />, label: "Chats" },
                    { to: "/profile", icon: <User size={22} />, label: "Perfil" },
                ].map(({ to, icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={to === "/notifications" ? () => setTimeout(fetchNotificationCount, 500) : undefined}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                                isActive
                                    ? "text-yellow-500"
                                    : "text-muted-foreground"
                            }`
                        }
                    >
                        {icon}
                        <span className="text-[9px] font-semibold tracking-wide">{label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
