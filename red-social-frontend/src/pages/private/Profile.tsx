import { useEffect, useState } from "react";
import {
    CalendarDays,
    Camera,
    Heart,
    ImageIcon,
    Mail,
    MapPin,
    MessageCircle,
    Pencil,
    Trash2,
    GraduationCap,
    Phone,
    User as UserIcon,
    Sparkles,
    FileEdit,
    BarChart2,
} from "lucide-react";

import {
    updateAvatarRequest,
    updateCoverImageRequest,
} from "@/api/user.api";

import { useAuthStore } from "@/store/auth.store";
import {
    deletePostRequest,
    getMyPostsRequest,
    updatePostRequest,
    updatePostVisibilityRequest,
} from "@/api/post.api";
import type { Post } from "@/types/auth";
import EditProfileModal from "@/components/EditProfileModal";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const DEFAULT_AVATAR =
    "https://ui-avatars.com/api/?name=UniConnect&background=f5b800&color=000&bold=true";

const DEFAULT_COVER =
    "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1400&auto=format&fit=crop";

const getImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${BACKEND_URL}${imageUrl}`;
};

type TabType = "posts" | "media" | "likes";

export default function Profile() {
    const { user, updateUserProfile } = useAuthStore();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>("posts");

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState("");

    const [localAvatar, setLocalAvatar] = useState<string | null>(null);
    const [localCover, setLocalCover] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const profile = user?.profile;

    const fullName =
        `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
        "Usuario";

    const username = profile?.username || "usuario";

    const avatarUrl =
        localAvatar ||
        (profile?.avatar && profile.avatar.startsWith("http")
            ? profile.avatar
            : DEFAULT_AVATAR);

    const coverUrl =
        localCover ||
        (profile?.coverImage && profile.coverImage.startsWith("http")
            ? profile.coverImage
            : DEFAULT_COVER);

    const fetchMyPosts = async () => {
        try {
            const data = await getMyPostsRequest();
            setPosts(data);
        } catch (error) {
            console.error("Error cargando posts del perfil", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyPosts();
    }, []);

    const postsWithImage = posts.filter((post) => post.imageUrl);
    const totalLikes = posts.reduce((total, post) => total + (post.reactions?.length || 0), 0);

    const visiblePosts =
        activeTab === "media"
            ? postsWithImage
            : activeTab === "likes"
                ? posts.filter((post) => (post.reactions?.length || 0) > 0)
                : posts;

    const handleAvatarChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            setUploadingAvatar(true);
            const updatedProfile = await updateAvatarRequest(file);
            setLocalAvatar(updatedProfile.avatar);
            updateUserProfile(updatedProfile);
        } catch (error) {
            console.error("Error actualizando avatar", error);
            alert("No se pudo actualizar la foto de perfil");
        } finally {
            setUploadingAvatar(false);
            event.target.value = "";
        }
    };

    const handleCoverChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            setUploadingCover(true);
            const updatedProfile = await updateCoverImageRequest(file);
            setLocalCover(updatedProfile.coverImage);
            updateUserProfile(updatedProfile);
        } catch (error) {
            console.error("Error actualizando portada", error);
            alert("No se pudo actualizar la portada");
        } finally {
            setUploadingCover(false);
            event.target.value = "";
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar este post?")) return;
        try {
            await deletePostRequest(id);
            setPosts((prev) => prev.filter((post) => post.id !== id));
        } catch {
            alert("Error al eliminar el post");
        }
    };

    const handleEdit = (post: Post) => {
        setEditingId(post.id);
        setEditContent(post.content);
    };

    const handleSaveEdit = async (id: number) => {
        if (!editContent.trim()) return;
        try {
            await updatePostRequest(id, { content: editContent });
            setPosts((prev) =>
                prev.map((post) =>
                    post.id === id ? { ...post, content: editContent } : post,
                ),
            );
            setEditingId(null);
            setEditContent("");
        } catch {
            alert("Error al actualizar el post");
        }
    };

    const handleVisibility = async (
        id: number,
        visibility: "public" | "friends" | "private",
    ) => {
        try {
            await updatePostVisibilityRequest(id, visibility);
            setPosts((prev) =>
                prev.map((post) =>
                    post.id === id ? { ...post, visibility } : post,
                ),
            );
        } catch {
            alert("Error al actualizar visibilidad");
        }
    };

    const tabs: { id: TabType; label: string; icon: React.ReactNode; count: number }[] = [
        { id: "posts", label: "Posts", icon: <FileEdit size={15} />, count: posts.length },
        { id: "media", label: "Media", icon: <ImageIcon size={15} />, count: postsWithImage.length },
        { id: "likes", label: "Likes", icon: <Heart size={15} />, count: totalLikes },
    ];

    return (
        <div className="max-w-4xl mx-auto pb-10 space-y-6 animate-fade-in">
            {/* ── Profile Card ── */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                {/* Cover image */}
                <div className="relative h-48 md:h-60 overflow-hidden">
                    <img
                        src={coverUrl}
                        alt="Portada"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    <label className="absolute right-4 bottom-4 bg-black/60 hover:bg-black/80 text-white rounded-xl px-4 py-2 transition cursor-pointer flex items-center gap-2 text-xs font-semibold backdrop-blur-sm border border-white/10">
                        <Camera size={16} />
                        {uploadingCover ? "Subiendo..." : "Cambiar portada"}
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            className="hidden"
                            onChange={handleCoverChange}
                            disabled={uploadingCover}
                        />
                    </label>
                </div>

                {/* Profile info */}
                <div className="relative px-6 pb-6">
                    <div className="flex items-end justify-between -mt-10 md:-mt-14">
                        {/* Avatar */}
                        <div className="relative">
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                className="w-20 h-20 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-card bg-card shadow-xl"
                            />
                            <label className="absolute -right-1 -bottom-1 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl p-1.5 cursor-pointer shadow-lg transition">
                                <Camera size={14} />
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/jpg"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                    disabled={uploadingAvatar}
                                />
                            </label>
                        </div>

                        {/* Edit button */}
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex items-center gap-1.5 md:gap-2 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black font-semibold px-3 py-2 md:px-5 md:py-2.5 rounded-xl transition-all shadow-md shadow-yellow-500/20 hover:shadow-yellow-500/40 text-xs md:text-sm"
                        >
                            <Pencil size={14} className="md:w-[16px] md:h-[16px]" />
                            Editar perfil
                        </button>
                    </div>

                    {/* Name & bio */}
                    <div className="mt-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
                            {user?.role === "admin" && (
                                <span className="text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full">Admin</span>
                            )}
                            {user?.role === "moderator" && (
                                <span className="text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full">Moderador</span>
                            )}
                        </div>
                        <p className="text-muted-foreground text-sm">@{username}</p>

                        <p className="mt-3 max-w-2xl text-sm text-foreground/85 leading-relaxed">
                            {profile?.bio ||
                                "Estudiante universitario usando UniConnect para compartir publicaciones, ideas y momentos."}
                        </p>

                        {/* Hobbies */}
                        {profile?.hobbies && (
                            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                <span className="text-yellow-400 font-semibold flex items-center gap-1 text-xs">
                                    <Sparkles size={13} /> Intereses:
                                </span>
                                {profile.hobbies.split(",").map((hobby, i) => (
                                    <span
                                        key={i}
                                        className="bg-muted text-muted-foreground border border-border px-2.5 py-0.5 rounded-full text-xs"
                                    >
                                        {hobby.trim()}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Info grid */}
                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Mail size={14} className="text-yellow-500/80 flex-shrink-0" />
                                <span className="truncate max-w-[200px]">{user?.email}</span>
                            </span>

                            <span className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-yellow-500/80 flex-shrink-0" />
                                <span>Universidad Privada del Norte</span>
                            </span>

                            {profile?.career && (
                                <span className="flex items-center gap-1.5">
                                    <GraduationCap size={14} className="text-yellow-500/80 flex-shrink-0" />
                                    <span>{profile.career}{profile.cycle ? ` · ${profile.cycle}` : ""}</span>
                                </span>
                            )}

                            {profile?.phone && (
                                <span className="flex items-center gap-1.5">
                                    <Phone size={14} className="text-yellow-500/80 flex-shrink-0" />
                                    <span>{profile.phone}</span>
                                </span>
                            )}

                            {profile?.gender && (
                                <span className="flex items-center gap-1.5">
                                    <UserIcon size={14} className="text-yellow-500/80 flex-shrink-0" />
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
                                    <CalendarDays size={14} className="text-yellow-500/80 flex-shrink-0" />
                                    <span>
                                        {new Date(profile.birthDate).toLocaleDateString("es", {
                                            day: "numeric",
                                            month: "long",
                                        })}
                                    </span>
                                </span>
                            )}
                        </div>

                        {/* Stats bar */}
                        <div className="mt-5 flex gap-6 pt-4 border-t border-border">
                            <div className="text-center">
                                <p className="text-xl font-bold text-foreground">{posts.length}</p>
                                <p className="text-xs text-muted-foreground">Posts</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold text-foreground">{postsWithImage.length}</p>
                                <p className="text-xs text-muted-foreground">Media</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xl font-bold text-foreground">{totalLikes}</p>
                                <p className="text-xs text-muted-foreground">Likes</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Edit Profile Modal ── */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSaveSuccess={fetchMyPosts}
            />

            {/* ── Tabs ── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex border-b border-border">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all ${
                                activeTab === tab.id
                                    ? "text-yellow-400 border-b-2 border-yellow-400 bg-yellow-500/5"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                activeTab === tab.id
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-muted text-muted-foreground"
                            }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Posts content */}
                <div className="p-4">
                    {loading ? (
                        <div className="space-y-3 py-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="skeleton h-24 rounded-xl" />
                            ))}
                        </div>
                    ) : visiblePosts.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            {activeTab === "media" ? (
                                <>
                                    <ImageIcon className="mx-auto mb-3 opacity-40" size={40} />
                                    <p className="font-medium">No tienes publicaciones con imágenes</p>
                                </>
                            ) : activeTab === "likes" ? (
                                <>
                                    <Heart className="mx-auto mb-3 opacity-40" size={40} />
                                    <p className="font-medium">Aún no tienes posts con reacciones</p>
                                </>
                            ) : (
                                <>
                                    <BarChart2 className="mx-auto mb-3 opacity-40" size={40} />
                                    <p className="font-medium">Aún no tienes publicaciones</p>
                                    <p className="text-xs mt-1">Comparte algo con la comunidad</p>
                                </>
                            )}
                        </div>
                    ) : activeTab === "media" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {visiblePosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="group relative bg-muted border border-border rounded-xl overflow-hidden aspect-square"
                                >
                                    <img
                                        src={getImageUrl(post.imageUrl)}
                                        alt="Post"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <div className="flex gap-4 text-white text-sm font-semibold">
                                            <span className="flex items-center gap-1">
                                                <Heart size={16} /> {post.reactions?.length || 0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle size={16} /> {post.comments?.length || 0}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {visiblePosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="bg-background border border-border rounded-2xl p-4 hover:border-border/80 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex gap-3">
                                            <img
                                                src={avatarUrl}
                                                alt="Avatar"
                                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                            />
                                            <div>
                                                <p className="font-semibold text-sm">{fullName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(post.createdAt).toLocaleString("es", {
                                                        day: "numeric",
                                                        month: "short",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <select
                                            value={post.visibility || "public"}
                                            onChange={(e) =>
                                                handleVisibility(
                                                    post.id,
                                                    e.target.value as "public" | "friends" | "private",
                                                )
                                            }
                                            className="bg-muted border border-border rounded-lg px-2 py-1 text-xs text-muted-foreground outline-none"
                                        >
                                            <option value="public">🌍 Público</option>
                                            <option value="friends">👥 Amigos</option>
                                            <option value="private">🔒 Privado</option>
                                        </select>
                                    </div>

                                    {editingId === post.id ? (
                                        <div className="mt-3 space-y-2">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full min-h-20 bg-card border border-border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition resize-none"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleSaveEdit(post.id)}
                                                    className="bg-green-600 hover:bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setEditContent("");
                                                    }}
                                                    className="bg-muted hover:bg-muted/80 text-sm font-semibold px-4 py-2 rounded-xl transition"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-3 text-sm leading-relaxed">{post.content}</p>
                                    )}

                                    {post.imageUrl && (
                                        <img
                                            src={getImageUrl(post.imageUrl)}
                                            alt="Imagen del post"
                                            className="mt-3 w-full max-h-96 object-contain rounded-xl border border-border bg-muted"
                                        />
                                    )}

                                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                                        <div className="flex gap-4">
                                            <span className="flex items-center gap-1">
                                                <Heart size={14} className="text-red-400" />
                                                {post.reactions?.length || 0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle size={14} className="text-blue-400" />
                                                {post.comments?.length || 0}
                                            </span>
                                        </div>

                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEdit(post)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-muted text-xs font-medium transition"
                                            >
                                                <Pencil size={13} /> Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 text-xs font-medium transition"
                                            >
                                                <Trash2 size={13} /> Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}