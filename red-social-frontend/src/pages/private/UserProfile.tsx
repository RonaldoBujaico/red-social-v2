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

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Mail size={13} className="text-yellow-500 flex-shrink-0" />
                                <span className="truncate max-w-[200px]">{user.email}</span>
                            </span>

                            <span className="flex items-center gap-1.5">
                                <GraduationCap size={13} className="text-yellow-500 flex-shrink-0" />
                                <span>{profile?.university || "Universidad Privada del Norte"} {profile?.faculty ? `· Fac. ${profile.faculty}` : ""}</span>
                            </span>

                            {profile?.career && (
                                <span className="flex items-center gap-1.5">
                                    <GraduationCap size={13} className="text-yellow-500 flex-shrink-0" />
                                    <span>{profile.career} {profile.academic_cycle ? `· Ciclo ${profile.academic_cycle}` : profile.cycle ? `· Ciclo ${profile.cycle}` : ""}</span>
                                </span>
                            )}

                            {profile?.phone && (
                                <span className="flex items-center gap-1.5">
                                    <Phone size={13} className="text-yellow-500 flex-shrink-0" />
                                    <span>{profile.phone}</span>
                                </span>
                            )}

                            {profile?.gender && (
                                <span className="flex items-center gap-1.5">
                                    <UserIcon size={13} className="text-yellow-500 flex-shrink-0" />
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
                                <span className="flex items-center gap-1.5">
                                    <CalendarDays size={13} className="text-yellow-500 flex-shrink-0" />
                                    <span>Nacimiento: {new Date(profile.birthDate).toLocaleDateString("es", { day: "numeric", month: "long" })}</span>
                                </span>
                            )}

                            {(profile?.country || profile?.department || profile?.district) && (
                                <span className="flex items-center gap-1.5">
                                    <MapPin size={13} className="text-yellow-500 flex-shrink-0" />
                                    <span>{[profile?.district, profile?.province, profile?.department, profile?.country].filter(Boolean).join(", ")}</span>
                                </span>
                            )}
                        </div>

                        {/* Nueva Sección Académica Estructurada Premium */}
                        <div className="mt-5 p-4 rounded-2xl bg-muted/30 border border-border space-y-4">
                            <h3 className="font-extrabold text-xs text-yellow-500 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles size={14} className="fill-yellow-500/10" />
                                Expediente Académico e Intereses
                            </h3>

                            {profile?.biography && (
                                <div className="text-xs text-foreground/80 leading-relaxed bg-background/50 p-3 rounded-xl border border-border">
                                    <span className="font-bold text-yellow-500 block mb-1">Presentación Académica:</span>
                                    {profile.biography}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user?.skills && user.skills.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                                            💻 Habilidades Técnicas
                                        </h4>
                                        <div className="flex flex-wrap gap-1">
                                            {user.skills.map((s, idx) => (
                                                <span key={idx} className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-lg text-[10px] font-semibold">
                                                    {s.skillName}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {user?.interests && user.interests.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                                            🎯 Intereses Científicos
                                        </h4>
                                        <div className="flex flex-wrap gap-1">
                                            {user.interests.map((i, idx) => (
                                                <span key={idx} className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-lg text-[10px] font-semibold">
                                                    {i.interestName}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {user?.courses && user.courses.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                                            📚 Cursos de Enfoque
                                        </h4>
                                        <div className="flex flex-wrap gap-1">
                                            {user.courses.map((c, idx) => (
                                                <span key={idx} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-lg text-[10px] font-semibold">
                                                    {c.courseName}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {user?.researchTopics && user.researchTopics.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">
                                            🔬 Temas de Investigación
                                        </h4>
                                        <div className="flex flex-wrap gap-1">
                                            {user.researchTopics.map((t, idx) => (
                                                <span key={idx} className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-lg text-[10px] font-semibold">
                                                    {t.topicName}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
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