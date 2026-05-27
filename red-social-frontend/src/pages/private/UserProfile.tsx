import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Heart, Mail, MessageCircle, UserPlus, Flag, GraduationCap, Phone, User as UserIcon, Sparkles, MapPin, CalendarDays } from "lucide-react";
import type { Post, User } from "@/types/auth";
import {
    getUserByIdRequest,
    sendFriendRequestRequest,
} from "@/api/user.api";
import { getPostsByUserIdRequest } from "@/api/post.api";
import ReportModal from "@/components/ReportModal";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const DEFAULT_AVATAR =
    "https://ui-avatars.com/api/?name=UN&background=facc15&color=000";

const DEFAULT_COVER =
    "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1400&auto=format&fit=crop";

const getImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return "";

    if (imageUrl.startsWith("http")) {
        return imageUrl;
    }

    return `${BACKEND_URL}${imageUrl}`;
};

type TabType = "posts" | "media" | "likes";

export default function UserProfile() {
    const { id } = useParams();

    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<TabType>("posts");
    const [sendingRequest, setSendingRequest] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            try {
                setLoading(true);

                const userId = Number(id);

                const [userResult, postsResult] = await Promise.all([
                    getUserByIdRequest(userId),
                    getPostsByUserIdRequest(userId),
                ]);

                setUser(userResult);
                setPosts(postsResult);
            } catch (error) {
                console.error("Error obteniendo perfil de usuario", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleSendFriendRequest = async () => {
        if (!user || sendingRequest || requestSent) return;

        try {
            setSendingRequest(true);

            await sendFriendRequestRequest(user.id);

            setRequestSent(true);
            alert("Solicitud de amistad enviada");
        } catch (error: any) {
            console.error("Error enviando solicitud", error);

            const message =
                error?.response?.data?.message ||
                error?.message ||
                "No se pudo enviar la solicitud";

            alert(message);
        } finally {
            setSendingRequest(false);
        }
    };

    if (loading) {
        return (
            <p className="text-center text-muted-foreground mt-10">
                Cargando perfil...
            </p>
        );
    }

    if (!user) {
        return (
            <p className="text-center text-muted-foreground mt-10">
                Usuario no encontrado.
            </p>
        );
    }

    const profile = user.profile;

    const fullName =
        `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
        "Usuario";

    const username = profile?.username || "usuario";

    const avatar = profile?.avatar || DEFAULT_AVATAR;
    const cover = profile?.coverImage || DEFAULT_COVER;

    const postsWithImage = posts.filter((post) => post.imageUrl);

    const totalLikes = posts.reduce(
        (total, post) => total + (post.reactions?.length || 0),
        0,
    );

    const visiblePosts =
        activeTab === "media"
            ? postsWithImage
            : activeTab === "likes"
                ? posts.filter((post) => (post.reactions?.length || 0) > 0)
                : posts;

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="h-52">
                    <img
                        src={cover}
                        alt="Portada"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="px-6 pb-6">
                    <div className="flex items-end justify-between">
                        <img
                            src={avatar}
                            alt={fullName}
                            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-background -mt-10 md:-mt-12 bg-background"
                        />

                        <div className="flex gap-2 items-center">
                            <button
                                onClick={handleSendFriendRequest}
                                disabled={sendingRequest || requestSent}
                                className={`font-semibold px-4 py-1.5 md:px-5 md:py-2 text-xs md:text-sm rounded-full transition flex items-center gap-2 ${requestSent
                                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                                        : "bg-yellow-500 hover:bg-yellow-400 text-black"
                                    }`}
                            >
                                <UserPlus size={16} className="md:w-[18px] md:h-[18px]" />
                                <span>
                                    {sendingRequest
                                        ? "Enviando..."
                                        : requestSent
                                            ? "Solicitud enviada"
                                            : "Enviar solicitud"}
                                </span>
                            </button>

                            <button
                                onClick={() => setIsReportModalOpen(true)}
                                className="p-2 border border-border hover:bg-muted text-muted-foreground hover:text-red-500 rounded-full transition flex items-center justify-center"
                                title="Reportar usuario"
                            >
                                <Flag size={16} className="md:w-[18px] md:h-[18px]" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h1 className="text-2xl font-bold">{fullName}</h1>
                        <p className="text-muted-foreground">@{username}</p>

                        <p className="mt-4 text-sm text-foreground">
                            {profile?.bio ||
                                "Este usuario aún no ha agregado una biografía."}
                        </p>

                        {/* Hobbies / Intereses */}
                        {profile?.hobbies && (
                            <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-xs">
                                <span className="text-yellow-400 font-semibold flex items-center gap-1">
                                    <Sparkles size={13} /> Intereses:
                                </span>
                                {profile.hobbies.split(",").map((hobby, i) => (
                                    <span key={i} className="bg-muted px-2.5 py-1 rounded-full text-muted-foreground border border-border">
                                        {hobby.trim()}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <Mail size={16} className="text-yellow-500/80" />
                                <span className="truncate">{user.email}</span>
                            </span>

                            <span className="flex items-center gap-2">
                                <MapPin size={16} className="text-yellow-500/80" />
                                <span>Universidad Privada del Norte</span>
                            </span>

                            {profile?.career && (
                                <span className="flex items-center gap-2">
                                    <GraduationCap size={16} className="text-yellow-500/80" />
                                    <span className="truncate">{profile.career} {profile.cycle ? `(${profile.cycle})` : ""}</span>
                                </span>
                            )}

                            {profile?.phone && (
                                <span className="flex items-center gap-2">
                                    <Phone size={16} className="text-yellow-500/80" />
                                    <span>{profile.phone}</span>
                                </span>
                            )}

                            {profile?.gender && (
                                <span className="flex items-center gap-2">
                                    <UserIcon size={16} className="text-yellow-500/80" />
                                    <span>
                                        {profile.gender === "male"
                                            ? "Masculino"
                                            : profile.gender === "female"
                                            ? "Femenino"
                                            : "Otro"}
                                    </span>
                                </span>
                            )}

                            {profile?.birthDate && (
                                <span className="flex items-center gap-2">
                                    <CalendarDays size={16} className="text-yellow-500/80" />
                                    <span>Nacimiento: {new Date(profile.birthDate).toLocaleDateString("es", { day: "numeric", month: "long" })}</span>
                                </span>
                            )}
                        </div>

                        <div className="mt-4 flex gap-6 text-sm">
                            <span>
                                <b>{posts.length}</b>{" "}
                                <span className="text-muted-foreground">
                                    Posts
                                </span>
                            </span>

                            <span>
                                <b>{postsWithImage.length}</b>{" "}
                                <span className="text-muted-foreground">
                                    Media
                                </span>
                            </span>

                            <span>
                                <b>{totalLikes}</b>{" "}
                                <span className="text-muted-foreground">
                                    Likes
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 border-b border-border flex gap-8">
                <button
                    onClick={() => setActiveTab("posts")}
                    className={`pb-3 font-semibold transition ${activeTab === "posts"
                            ? "text-yellow-400 border-b-2 border-yellow-400"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Posts
                </button>

                <button
                    onClick={() => setActiveTab("media")}
                    className={`pb-3 font-semibold transition ${activeTab === "media"
                            ? "text-yellow-400 border-b-2 border-yellow-400"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Media
                </button>

                <button
                    onClick={() => setActiveTab("likes")}
                    className={`pb-3 font-semibold transition ${activeTab === "likes"
                            ? "text-yellow-400 border-b-2 border-yellow-400"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    Likes
                </button>
            </div>

            {visiblePosts.length === 0 ? (
                <div className="mt-8 bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                    {activeTab === "media"
                        ? "Este usuario no tiene publicaciones con imágenes."
                        : activeTab === "likes"
                            ? "Este usuario no tiene posts con likes."
                            : "Este usuario aún no ha publicado nada."}
                </div>
            ) : activeTab === "media" ? (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visiblePosts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-card border border-border rounded-2xl overflow-hidden"
                        >
                            <img
                                src={getImageUrl(post.imageUrl)}
                                alt="Post"
                                className="w-full h-48 object-cover"
                            />

                            <div className="p-3">
                                <p className="text-sm line-clamp-2">
                                    {post.content}
                                </p>

                                <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Heart size={14} />
                                        {post.reactions?.length || 0}
                                    </span>

                                    <span className="flex items-center gap-1">
                                        <MessageCircle size={14} />
                                        {post.comments?.length || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {visiblePosts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-card border border-border rounded-2xl p-4 shadow-sm"
                        >
                            <div className="flex gap-3">
                                <img
                                    src={avatar}
                                    alt={fullName}
                                    className="w-10 h-10 rounded-full object-cover"
                                />

                                <div>
                                    <h3 className="font-semibold">
                                        {fullName}
                                    </h3>

                                    <p className="text-xs text-muted-foreground">
                                        {new Date(
                                            post.createdAt,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <p className="mt-4">{post.content}</p>

                            {post.imageUrl && (
                                <img
                                    src={getImageUrl(post.imageUrl)}
                                    alt="Imagen del post"
                                    className="mt-4 w-full max-h-[420px] object-contain rounded-2xl border border-border bg-muted"
                                />
                            )}

                            <div className="mt-4 flex gap-6 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Heart size={16} />
                                    {post.reactions?.length || 0}
                                </span>

                                <span className="flex items-center gap-1">
                                    <MessageCircle size={16} />
                                    {post.comments?.length || 0}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                reportedUserId={user.id}
                reportedTargetName={`al usuario @${username}`}
            />
        </div>
    );
}