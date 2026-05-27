import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Send,
    MessageCircleMore,
    Sparkles,
    Circle,
    Loader2,
    ArrowLeft,
} from "lucide-react";
import { getAcceptedFriendsRequest } from "@/api/user.api";
import {
    getConversationRequest,
    markConversationAsReadRequest,
    sendMessageRequest,
} from "@/api/message.api";
import type { User } from "@/types/auth";
import { useAuthStore } from "@/store/auth.store";

type Message = {
    id: number;
    content: string;
    isRead: boolean;
    createdAt: string;
    sender: User;
    receiver: User;
};

const getAvatar = (user: User) => {
    if (user.profile?.avatar) return user.profile.avatar;

    const name =
        `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() ||
        "UN";

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name,
    )}&background=facc15&color=000000`;
};

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

const formatHour = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function Messages() {
    const { user } = useAuthStore();

    const [friends, setFriends] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingConversation, setLoadingConversation] = useState(false);
    const [sending, setSending] = useState(false);

    const [search, setSearch] = useState("");
    const [selectedFriendId, setSelectedFriendId] = useState<number | null>(
        null,
    );
    const [messageText, setMessageText] = useState("");
    const [activeMobilePane, setActiveMobilePane] = useState<"list" | "chat">("list");

    const [conversations, setConversations] = useState<
        Record<number, Message[]>
    >({});

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                setLoading(true);

                const data = await getAcceptedFriendsRequest();
                setFriends(data);

                if (data.length > 0) {
                    setSelectedFriendId(data[0].id);
                }
            } catch (error) {
                console.error("Error cargando amigos aceptados", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, []);

    useEffect(() => {
        const fetchConversation = async () => {
            if (!selectedFriendId) return;

            try {
                setLoadingConversation(true);

                const messages = await getConversationRequest(selectedFriendId);

                setConversations((prev) => ({
                    ...prev,
                    [selectedFriendId]: messages,
                }));

                await markConversationAsReadRequest(selectedFriendId);
            } catch (error) {
                console.error("Error cargando conversación", error);
            } finally {
                setLoadingConversation(false);
            }
        };

        fetchConversation();
    }, [selectedFriendId]);

    const filteredFriends = useMemo(() => {
        const term = search.toLowerCase().trim();

        if (!term) return friends;

        return friends.filter((friend) => {
            const fullName = getFullName(friend).toLowerCase();
            const username = getUsername(friend).toLowerCase();

            return fullName.includes(term) || username.includes(term);
        });
    }, [friends, search]);

    const selectedFriend =
        friends.find((friend) => friend.id === selectedFriendId) || null;

    const currentMessages = selectedFriend
        ? conversations[selectedFriend.id] || []
        : [];

    const handleSelectFriend = (friendId: number) => {
        setSelectedFriendId(friendId);
        setActiveMobilePane("chat");
    };

    const handleSendMessage = async () => {
        if (!selectedFriend || !messageText.trim() || sending) return;

        try {
            setSending(true);

            const savedMessage = await sendMessageRequest(
                selectedFriend.id,
                messageText,
            );

            setConversations((prev) => ({
                ...prev,
                [selectedFriend.id]: [
                    ...(prev[selectedFriend.id] || []),
                    savedMessage,
                ],
            }));

            setMessageText("");
        } catch (error) {
            console.error("Error enviando mensaje", error);
            alert("No se pudo enviar el mensaje");
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto">
                <div className="bg-card border border-border rounded-3xl p-10 text-center text-muted-foreground">
                    Cargando mensajes...
                </div>
            </div>
        );
    }

    if (friends.length === 0) {
        return (
            <div className="max-w-5xl mx-auto">
                <div className="bg-card border border-border rounded-3xl p-10 text-center">
                    <div className="w-20 h-20 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center mx-auto mb-5">
                        <MessageCircleMore size={34} />
                    </div>

                    <h2 className="text-2xl font-bold mb-2">
                        Aún no tienes amistades aceptadas
                    </h2>

                    <p className="text-muted-foreground max-w-xl mx-auto">
                        Cuando aceptes una solicitud de amistad, esa persona
                        aparecerá aquí para conversar.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-2rem)]">
            <div className="h-full bg-card border border-border rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-[340px_1fr]">
                <div className={`border-r border-border flex flex-col bg-background/40 h-full ${
                    activeMobilePane === "chat" ? "hidden lg:flex" : "flex"
                }`}>
                    <div className="p-5 border-b border-border">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                                <Sparkles size={20} />
                            </div>

                            <div>
                                <h2 className="text-xl font-bold">Mensajes</h2>
                                <p className="text-sm text-muted-foreground">
                                    Conversa con tus amistades aceptadas
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />

                            <input
                                type="text"
                                placeholder="Buscar conversación..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-background outline-none focus:ring-2 focus:ring-yellow-500/30"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {filteredFriends.length === 0 ? (
                            <div className="p-6 text-sm text-muted-foreground">
                                No se encontraron usuarios.
                            </div>
                        ) : (
                            <div className="p-3 space-y-2">
                                {filteredFriends.map((friend) => {
                                    const isActive =
                                        selectedFriendId === friend.id;

                                    const conversation =
                                        conversations[friend.id] || [];
                                    const lastMessage =
                                        conversation[conversation.length - 1];

                                    return (
                                        <button
                                            key={friend.id}
                                            onClick={() =>
                                                handleSelectFriend(friend.id)
                                            }
                                            className={`w-full text-left p-3 rounded-2xl transition border ${isActive
                                                    ? "bg-yellow-500/10 border-yellow-500/30"
                                                    : "bg-transparent border-transparent hover:bg-muted/60"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <img
                                                        src={getAvatar(friend)}
                                                        alt={getFullName(
                                                            friend,
                                                        )}
                                                        className="w-14 h-14 rounded-full object-cover border border-border"
                                                    />

                                                    <span className="absolute right-0 bottom-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="font-semibold truncate">
                                                            {getFullName(
                                                                friend,
                                                            )}
                                                        </p>

                                                        {lastMessage && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatHour(
                                                                    lastMessage.createdAt,
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-sm text-muted-foreground truncate">
                                                        @{getUsername(friend)}
                                                    </p>

                                                    <p className="text-xs text-muted-foreground truncate mt-1">
                                                        {lastMessage?.content ||
                                                            "Sin mensajes todavía"}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className={`flex flex-col h-full ${
                    activeMobilePane === "list" ? "hidden lg:flex" : "flex"
                }`}>
                    {selectedFriend ? (
                        <>
                            <div className="px-6 py-4 border-b border-border bg-background/30 flex items-center justify-between">
                                <div className="flex items-center gap-3 md:gap-4">
                                    <button
                                        onClick={() => setActiveMobilePane("list")}
                                        className="lg:hidden p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition"
                                        title="Volver a la lista"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>

                                    <div className="relative">
                                        <img
                                            src={getAvatar(selectedFriend)}
                                            alt={getFullName(selectedFriend)}
                                            className="w-14 h-14 rounded-full object-cover border border-border"
                                        />

                                        <span className="absolute right-0 bottom-0 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background" />
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold">
                                            {getFullName(selectedFriend)}
                                        </h3>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Circle
                                                size={8}
                                                className="fill-green-500 text-green-500"
                                            />
                                            Chat disponible
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:block text-sm text-muted-foreground">
                                    @{getUsername(selectedFriend)}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-6 py-6 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.05),transparent_35%)]">
                                <div className="max-w-3xl mx-auto space-y-4">
                                    {loadingConversation ? (
                                        <div className="flex items-center justify-center text-muted-foreground py-10">
                                            <Loader2
                                                size={22}
                                                className="animate-spin mr-2"
                                            />
                                            Cargando conversación...
                                        </div>
                                    ) : currentMessages.length === 0 ? (
                                        <div className="text-center text-muted-foreground py-10">
                                            Todavía no hay mensajes. Escribe el
                                            primero 👋
                                        </div>
                                    ) : (
                                        currentMessages.map((msg) => {
                                            const isMine =
                                                msg.sender.id === user?.id;

                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${isMine
                                                            ? "justify-end"
                                                            : "justify-start"
                                                        }`}
                                                >
                                                    <div className="max-w-[75%]">
                                                        <div
                                                            className={`px-4 py-3 rounded-2xl shadow-sm ${isMine
                                                                    ? "bg-yellow-500 text-black rounded-br-md"
                                                                    : "bg-muted text-foreground rounded-bl-md"
                                                                }`}
                                                        >
                                                            <p className="text-sm leading-relaxed">
                                                                {msg.content}
                                                            </p>
                                                        </div>

                                                        <p
                                                            className={`text-xs text-muted-foreground mt-1 ${isMine
                                                                    ? "text-right"
                                                                    : "text-left"
                                                                }`}
                                                        >
                                                            {formatHour(
                                                                msg.createdAt,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border-t border-border bg-background/40">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        placeholder={`Escribe a ${selectedFriend.profile?.firstName ||
                                            selectedFriend.profile?.username
                                            }...`}
                                        value={messageText}
                                        onChange={(e) =>
                                            setMessageText(e.target.value)
                                        }
                                        onKeyDown={handleKeyDown}
                                        className="flex-1 px-4 py-3 rounded-2xl border border-border bg-background outline-none focus:ring-2 focus:ring-yellow-500/30"
                                    />

                                    <button
                                        onClick={handleSendMessage}
                                        disabled={
                                            sending || !messageText.trim()
                                        }
                                        className="px-5 py-3 rounded-2xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold transition flex items-center gap-2"
                                    >
                                        {sending ? (
                                            <Loader2
                                                size={18}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Send size={18} />
                                        )}
                                        Enviar
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            Selecciona una conversación
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}