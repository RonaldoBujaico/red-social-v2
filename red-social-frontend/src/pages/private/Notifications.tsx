import { useEffect, useState } from "react";
import {
    Bell,
    Check,
    Clock,
    Heart,
    MessageCircle,
    UserPlus,
    X,
    AlertTriangle,
} from "lucide-react";
import type { User } from "@/types/auth";
import {
    getReceivedFriendRequestsRequest,
    respondFriendRequestRequest,
} from "@/api/user.api";
import {
    getMyNotificationsRequest,
    markAllNotificationsAsReadRequest,
} from "@/api/notification.api";

const DEFAULT_AVATAR =
    "https://ui-avatars.com/api/?name=UN&background=facc15&color=000";

interface FriendRequest {
    id: number;
    status: "pending" | "accepted" | "rejected";
    createdAt: string;
    sender: User;
    receiver: User;
}

interface AppNotification {
    id: number;
    type: "friend_request" | "like" | "comment" | "warning";
    message: string;
    isRead: boolean;
    createdAt: string;
    sender: User;
    receiver: User;
    post?: {
        id: number;
        content: string;
        imageUrl?: string | null;
    } | null;
}

export default function Notifications() {
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [respondingId, setRespondingId] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            const [friendRequests, notificationsResult] = await Promise.all([
                getReceivedFriendRequestsRequest(),
                getMyNotificationsRequest(),
            ]);

            setRequests(friendRequests);
            setNotifications(notificationsResult);
        } catch (error) {
            console.error("Error cargando notificaciones", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRespond = async (
        requestId: number,
        status: "accepted" | "rejected",
    ) => {
        try {
            setRespondingId(requestId);

            await respondFriendRequestRequest(requestId, status);

            setRequests((prev) =>
                prev.filter((request) => request.id !== requestId),
            );
        } catch (error) {
            console.error("Error respondiendo solicitud", error);
            alert("No se pudo responder la solicitud");
        } finally {
            setRespondingId(null);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsAsReadRequest();

            setNotifications((prev) =>
                prev.map((notification) => ({
                    ...notification,
                    isRead: true,
                })),
            );
        } catch (error) {
            console.error("Error marcando como leídas", error);
        }
    };

    const hasItems = requests.length > 0 || notifications.length > 0;

    return (
        <div className="max-w-3xl mx-auto pb-10">
            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Bell className="text-yellow-400" size={26} />
                        Notificaciones
                    </h1>

                    <p className="text-sm text-muted-foreground mt-1">
                        Revisa solicitudes, likes y comentarios recientes.
                    </p>
                </div>

                {notifications.length > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm font-semibold text-yellow-400 hover:underline"
                    >
                        Marcar todo como leído
                    </button>
                )}
            </div>

            {loading ? (
                <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted-foreground">
                    Cargando notificaciones...
                </div>
            ) : !hasItems ? (
                <div className="bg-card border border-border rounded-2xl p-8 text-center">
                    <Bell
                        size={42}
                        className="mx-auto mb-3 text-muted-foreground"
                    />

                    <h2 className="text-lg font-semibold">
                        No tienes notificaciones nuevas
                    </h2>

                    <p className="text-sm text-muted-foreground mt-1">
                        Aquí aparecerán solicitudes de amistad, likes y
                        comentarios.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => {
                        const senderProfile = request.sender.profile;

                        const fullName =
                            `${senderProfile?.firstName || ""} ${senderProfile?.lastName || ""
                                }`.trim() || "Usuario";

                        const username = senderProfile?.username || "usuario";

                        const avatar = senderProfile?.avatar || DEFAULT_AVATAR;

                        return (
                            <div
                                key={`request-${request.id}`}
                                className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="relative">
                                        <img
                                            src={avatar}
                                            alt={fullName}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />

                                        <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-black rounded-full p-1">
                                            <UserPlus size={14} />
                                        </span>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-sm">
                                            <span className="font-semibold">
                                                {fullName}
                                            </span>{" "}
                                            te envió una solicitud de amistad.
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            @{username}
                                        </p>

                                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock size={13} />
                                            {new Date(
                                                request.createdAt,
                                            ).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={() =>
                                            handleRespond(
                                                request.id,
                                                "accepted",
                                            )
                                        }
                                        disabled={respondingId === request.id}
                                        className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition"
                                    >
                                        <Check size={16} />
                                        Aceptar
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleRespond(
                                                request.id,
                                                "rejected",
                                            )
                                        }
                                        disabled={respondingId === request.id}
                                        className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-1 transition"
                                    >
                                        <X size={16} />
                                        Rechazar
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {notifications.map((notification) => {
                        const senderProfile = notification.sender?.profile;

                        const fullName =
                            `${senderProfile?.firstName || ""} ${senderProfile?.lastName || ""
                                }`.trim() ||
                            senderProfile?.username ||
                            "Usuario";

                        const avatar = senderProfile?.avatar || DEFAULT_AVATAR;

                        const Icon =
                            notification.type === "like"
                                ? Heart
                                : notification.type === "warning"
                                ? AlertTriangle
                                : MessageCircle;

                        const iconClass =
                            notification.type === "like"
                                ? "bg-red-500/20 text-red-400"
                                : notification.type === "warning"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-blue-500/20 text-blue-400";

                        return (
                            <div
                                key={`notification-${notification.id}`}
                                className={`bg-card border rounded-2xl p-4 flex items-center gap-4 ${notification.isRead
                                        ? "border-border opacity-75"
                                        : "border-yellow-500/60"
                                    }`}
                            >
                                <div className="relative">
                                    <img
                                        src={avatar}
                                        alt={fullName}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />

                                    <span
                                        className={`absolute -bottom-1 -right-1 rounded-full p-1 ${iconClass}`}
                                    >
                                        <Icon size={14} />
                                    </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">
                                        {notification.message}
                                    </p>

                                    {notification.post?.content && (
                                        <p className="text-xs text-muted-foreground mt-1 truncate">
                                            “{notification.post.content}”
                                        </p>
                                    )}

                                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock size={13} />
                                        {new Date(
                                            notification.createdAt,
                                        ).toLocaleString()}
                                    </div>
                                </div>

                                {!notification.isRead && (
                                    <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0" />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}