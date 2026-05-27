import { useEffect, useMemo, useState } from "react";
import {
    Compass,
    Heart,
    ImageIcon,
    MessageCircle,
    Search,
    Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getAllPostsRequest } from "@/api/post.api";
import { useAuthStore } from "@/store/auth.store";
import type { Post } from "@/types/auth";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

type FilterType = "all" | "media" | "comments" | "likes";

const DEFAULT_AVATAR =
    "https://ui-avatars.com/api/?name=UN&background=facc15&color=000";

const getImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return "";

    if (imageUrl.startsWith("http")) {
        return imageUrl;
    }

    return `${BACKEND_URL}${imageUrl}`;
};

const getUserName = (post: Post) => {
    const profile = post.user?.profile;

    return (
        `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
        profile?.username ||
        "Usuario"
    );
};

const getUsername = (post: Post) => {
    return post.user?.profile?.username || "usuario";
};

const getAvatar = (post: Post) => {
    return post.user?.profile?.avatar || DEFAULT_AVATAR;
};

export default function Explore() {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await getAllPostsRequest();

                const otherUsersPosts = data.filter((post: Post) => {
                    const isMine = post.user?.id === user?.id;
                    const isPrivate = post.visibility === "private";

                    return !isMine && !isPrivate;
                });

                setPosts(otherUsersPosts);
            } catch (error) {
                console.error("Error cargando explorar", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [user?.id]);

    const filteredPosts = useMemo(() => {
        let result = [...posts];

        const term = search.trim().toLowerCase();

        if (term) {
            result = result.filter((post) => {
                const content = post.content?.toLowerCase() || "";
                const fullName = getUserName(post).toLowerCase();
                const username = getUsername(post).toLowerCase();

                return (
                    content.includes(term) ||
                    fullName.includes(term) ||
                    username.includes(term)
                );
            });
        }

        if (activeFilter === "media") {
            result = result.filter((post) => post.imageUrl);
        }

        if (activeFilter === "comments") {
            result = result.sort(
                (a, b) =>
                    (b.comments?.length || 0) - (a.comments?.length || 0),
            );
        }

        if (activeFilter === "likes") {
            result = result.sort(
                (a, b) =>
                    (b.reactions?.length || 0) - (a.reactions?.length || 0),
            );
        }

        return result;
    }, [posts, search, activeFilter]);

    const featuredPosts = posts
        .filter((post) => post.imageUrl)
        .slice(0, 3);

    const goToProfile = (userId?: number) => {
        if (!userId) return;
        navigate(`/users/${userId}`);
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="bg-card border border-border rounded-3xl p-10 text-center text-muted-foreground">
                    Cargando explorador...
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-10">
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                        <Compass size={26} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold">Explorar</h1>
                        <p className="text-sm text-muted-foreground">
                            Descubre publicaciones, ideas y momentos de otros
                            estudiantes.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
                <div className="bg-card border border-border rounded-3xl p-5">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar publicaciones, usuarios o temas..."
                            className="w-full bg-background border border-border rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30"
                        />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            onClick={() => setActiveFilter("all")}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${activeFilter === "all"
                                    ? "bg-yellow-500 text-black"
                                    : "bg-muted hover:bg-muted/80"
                                }`}
                        >
                            Todos
                        </button>

                        <button
                            onClick={() => setActiveFilter("media")}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${activeFilter === "media"
                                    ? "bg-yellow-500 text-black"
                                    : "bg-muted hover:bg-muted/80"
                                }`}
                        >
                            <ImageIcon size={16} />
                            Con imagen
                        </button>

                        <button
                            onClick={() => setActiveFilter("likes")}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${activeFilter === "likes"
                                    ? "bg-yellow-500 text-black"
                                    : "bg-muted hover:bg-muted/80"
                                }`}
                        >
                            <Heart size={16} />
                            Más likes
                        </button>

                        <button
                            onClick={() => setActiveFilter("comments")}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${activeFilter === "comments"
                                    ? "bg-yellow-500 text-black"
                                    : "bg-muted hover:bg-muted/80"
                                }`}
                        >
                            <MessageCircle size={16} />
                            Más comentados
                        </button>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-3xl p-5">
                    <div className="flex items-center gap-2 text-yellow-400 font-bold">
                        <Sparkles size={18} />
                        Resumen
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                        <div className="bg-muted/50 rounded-2xl p-3">
                            <p className="text-lg font-bold">
                                {posts.length}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Posts
                            </p>
                        </div>

                        <div className="bg-muted/50 rounded-2xl p-3">
                            <p className="text-lg font-bold">
                                {
                                    posts.filter((post) => post.imageUrl)
                                        .length
                                }
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Media
                            </p>
                        </div>

                        <div className="bg-muted/50 rounded-2xl p-3">
                            <p className="text-lg font-bold">
                                {posts.reduce(
                                    (total, post) =>
                                        total +
                                        (post.reactions?.length || 0),
                                    0,
                                )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Likes
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {featuredPosts.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">
                            Publicaciones destacadas
                        </h2>

                        <p className="text-sm text-muted-foreground">
                            Posts con imágenes recientes
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {featuredPosts.map((post) => (
                            <button
                                key={post.id}
                                onClick={() => goToProfile(post.user?.id)}
                                className="group relative h-52 rounded-3xl overflow-hidden border border-border bg-card text-left"
                            >
                                <img
                                    src={getImageUrl(post.imageUrl)}
                                    alt="Post destacado"
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                <div className="absolute left-4 right-4 bottom-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <img
                                            src={getAvatar(post)}
                                            alt={getUserName(post)}
                                            className="w-8 h-8 rounded-full object-cover border border-white/40"
                                        />

                                        <div className="min-w-0">
                                            <p className="text-white text-sm font-bold truncate">
                                                {getUserName(post)}
                                            </p>
                                            <p className="text-white/70 text-xs truncate">
                                                @{getUsername(post)}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-white text-sm line-clamp-2">
                                        {post.content}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Descubrir posts</h2>

                <p className="text-sm text-muted-foreground">
                    {filteredPosts.length} resultados
                </p>
            </div>

            {filteredPosts.length === 0 ? (
                <div className="bg-card border border-border rounded-3xl p-10 text-center">
                    <div className="w-20 h-20 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center mx-auto mb-4">
                        <Compass size={34} />
                    </div>

                    <h3 className="text-xl font-bold">
                        No hay publicaciones para mostrar
                    </h3>

                    <p className="text-muted-foreground mt-2">
                        Cuando otros usuarios publiquen contenido público,
                        aparecerá aquí.
                    </p>
                </div>
            ) : (
                <div className="columns-1 md:columns-2 xl:columns-3 gap-4 space-y-4">
                    {filteredPosts.map((post) => (
                        <div
                            key={post.id}
                            className="break-inside-avoid bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:border-yellow-500/50 transition"
                        >
                            {post.imageUrl && (
                                <img
                                    src={getImageUrl(post.imageUrl)}
                                    alt="Imagen publicación"
                                    className="w-full object-cover"
                                />
                            )}

                            <div className="p-4">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() =>
                                            goToProfile(post.user?.id)
                                        }
                                        className="flex-shrink-0"
                                    >
                                        <img
                                            src={getAvatar(post)}
                                            alt={getUserName(post)}
                                            className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-yellow-400 transition"
                                        />
                                    </button>

                                    <div className="min-w-0">
                                        <button
                                            onClick={() =>
                                                goToProfile(post.user?.id)
                                            }
                                            className="font-semibold hover:text-yellow-400 transition text-left truncate block"
                                        >
                                            {getUserName(post)}
                                        </button>

                                        <p className="text-xs text-muted-foreground truncate">
                                            @{getUsername(post)}
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-4 text-sm leading-relaxed">
                                    {post.content}
                                </p>

                                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                            <Heart size={16} />
                                            {post.reactions?.length || 0}
                                        </span>

                                        <span className="flex items-center gap-1">
                                            <MessageCircle size={16} />
                                            {post.comments?.length || 0}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() =>
                                            goToProfile(post.user?.id)
                                        }
                                        className="text-yellow-400 hover:underline font-semibold"
                                    >
                                        Ver perfil
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}