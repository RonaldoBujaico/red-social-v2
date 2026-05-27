import { useEffect, useState } from "react";
import {
    Flame,
    Loader2,
    Sparkles,
    UserPlus,
    Users,
    TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { User } from "@/types/auth";
import {
    getSuggestedUsersRequest,
    sendFriendRequestRequest,
} from "@/api/user.api";

const trends = [
    {
        tag: "#TechWeek2026",
        posts: "2K posts",
        description: "Eventos y tecnología",
    },
    {
        tag: "#CampusLife",
        posts: "4K posts",
        description: "Vida universitaria",
    },
    {
        tag: "#StudyTips",
        posts: "2K posts",
        description: "Tips de estudio",
    },
    {
        tag: "#UniSports",
        posts: "7K posts",
        description: "Deportes y torneos",
    },
];

const getFullName = (user: User) => {
    return (
        `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() ||
        user.profile?.username ||
        "Usuario"
    );
};

const getUsername = (user: User) => {
    return user.profile?.username || "usuario";
};

const getAvatar = (user: User) => {
    if (user.profile?.avatar) return user.profile.avatar;

    const name = getFullName(user);

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name,
    )}&background=facc15&color=000000`;
};

export default function RightSidebar() {
    const navigate = useNavigate();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [sendingId, setSendingId] = useState<number | null>(null);
    const [sentRequests, setSentRequests] = useState<number[]>([]);

    const fetchSuggestions = async () => {
        try {
            setLoading(true);
            const data = await getSuggestedUsersRequest();
            setUsers(data.slice(0, 3));
        } catch (error) {
            console.error("Error cargando usuarios sugeridos", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuggestions();
    }, []);

    const handleGoProfile = (userId: number) => {
        navigate(`/users/${userId}`);
    };

    const handleSendRequest = async (userId: number) => {
        if (sentRequests.includes(userId)) return;

        try {
            setSendingId(userId);

            await sendFriendRequestRequest(userId);

            setSentRequests((prev) => [...prev, userId]);

            setUsers((prev) => prev.filter((user) => user.id !== userId));
        } catch (error: any) {
            console.error("Error enviando solicitud", error);

            const message =
                error?.response?.data?.message ||
                error?.message ||
                "No se pudo enviar la solicitud";

            alert(message);
        } finally {
            setSendingId(null);
        }
    };

    return (
        <aside className="w-80 h-screen sticky top-0 border-l border-border px-5 py-6 space-y-5 overflow-y-auto bg-background/95">
            <section className="bg-card border border-border rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} className="text-yellow-400" />
                            <h2 className="font-bold text-lg">
                                Sugerido para ti
                            </h2>
                        </div>

                        <p className="text-xs text-muted-foreground mt-1">
                            Estudiantes que podrías conocer
                        </p>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                        <Users size={18} />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <Loader2 className="animate-spin mr-2" size={18} />
                        Cargando...
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-14 h-14 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center mx-auto mb-3">
                            <Users size={24} />
                        </div>

                        <p className="font-semibold">
                            No hay sugerencias nuevas
                        </p>

                        <p className="text-xs text-muted-foreground mt-1">
                            Cuando haya más usuarios disponibles aparecerán aquí.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {users.map((user) => {
                            const isSending = sendingId === user.id;
                            const wasSent = sentRequests.includes(user.id);

                            return (
                                <div
                                    key={user.id}
                                    className="group bg-background/60 border border-border rounded-2xl p-3 hover:border-yellow-500/40 transition"
                                >
                                    <div className="flex items-start gap-3">
                                        <button
                                            onClick={() => handleGoProfile(user.id)}
                                            className="flex-shrink-0"
                                        >
                                            <img
                                                src={getAvatar(user)}
                                                alt={getFullName(user)}
                                                className="w-12 h-12 rounded-full object-cover border border-border group-hover:ring-2 group-hover:ring-yellow-400 transition"
                                            />
                                        </button>

                                        <div className="min-w-0 flex-1">
                                            <button
                                                onClick={() => handleGoProfile(user.id)}
                                                className="text-left w-full"
                                            >
                                                <p className="font-semibold text-sm leading-tight group-hover:text-yellow-400 transition break-words">
                                                    {getFullName(user)}
                                                </p>

                                                <p className="text-xs text-muted-foreground mt-1 break-words">
                                                    @{getUsername(user)}
                                                </p>
                                            </button>

                                            <p className="text-[11px] text-muted-foreground mt-1">
                                                Disponible para conectar
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex justify-end">
                                        <button
                                            onClick={() => handleSendRequest(user.id)}
                                            disabled={isSending || wasSent}
                                            className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${wasSent
                                                    ? "bg-muted text-muted-foreground cursor-not-allowed"
                                                    : "bg-yellow-500 hover:bg-yellow-400 text-black"
                                                }`}
                                        >
                                            {isSending ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <UserPlus size={14} />
                                            )}

                                            {isSending
                                                ? "Enviando..."
                                                : wasSent
                                                    ? "Enviada"
                                                    : "Agregar"}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="bg-card border border-border rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <div className="flex items-center gap-2">
                            <Flame size={18} className="text-yellow-400" />
                            <h2 className="font-bold text-lg">Tendencias</h2>
                        </div>

                        <p className="text-xs text-muted-foreground mt-1">
                            Lo más hablado en UniConnect
                        </p>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                        <TrendingUp size={18} />
                    </div>
                </div>

                <div className="space-y-3">
                    {trends.map((trend, index) => (
                        <button
                            key={trend.tag}
                            className="w-full text-left p-3 rounded-2xl hover:bg-muted transition group"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-bold text-yellow-400 group-hover:underline">
                                        {trend.tag}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                        {trend.description}
                                    </p>
                                </div>

                                <span className="text-xs text-muted-foreground">
                                    #{index + 1}
                                </span>
                            </div>

                            <p className="text-xs text-muted-foreground mt-2">
                                {trend.posts}
                            </p>
                        </button>
                    ))}
                </div>
            </section>

            <section className="bg-gradient-to-br from-yellow-500/20 via-yellow-500/5 to-transparent border border-yellow-500/20 rounded-3xl p-5">
                <h3 className="font-bold">Consejo UniConnect</h3>

                <p className="text-sm text-muted-foreground mt-2">
                    Completa tu perfil con foto, biografía y portada para que
                    otros estudiantes te reconozcan más rápido.
                </p>

                <button
                    onClick={() => navigate("/profile")}
                    className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-2xl text-sm transition"
                >
                    Ver mi perfil
                </button>
            </section>
        </aside>
    );
}