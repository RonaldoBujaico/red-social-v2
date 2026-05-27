import { useEffect, useState, useMemo } from "react";
import { getAdminPostsRequest, adminDeletePostRequest } from "@/api/admin.api";
import { Search, Trash2, Image, MessageSquare, Heart, Eye, Filter, ChevronDown } from "lucide-react";

interface Post {
    id: number;
    content: string;
    visibility: string;
    createdAt: string;
    imageUrl?: string | null;
    user: {
        id: number;
        email: string;
        profile?: { firstName: string; lastName: string; username: string; avatar?: string };
    };
    comments: any[];
    reactions: any[];
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace("/api", "") || "";

export default function AdminContent() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterVisibility, setFilterVisibility] = useState("all");
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [previewPost, setPreviewPost] = useState<Post | null>(null);

    const loadPosts = async () => {
        setLoading(true);
        try {
            const data = await getAdminPostsRequest();
            setPosts(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadPosts(); }, []);

    const filtered = useMemo(() => {
        return posts.filter((p) => {
            const text = `${p.content} ${p.user?.profile?.username || ""} ${p.user?.email}`.toLowerCase();
            const matchSearch = text.includes(search.toLowerCase());
            const matchVis = filterVisibility === "all" || p.visibility === filterVisibility;
            return matchSearch && matchVis;
        });
    }, [posts, search, filterVisibility]);

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar esta publicación permanentemente?")) return;
        setDeletingId(id);
        try {
            await adminDeletePostRequest(id);
            setPosts((prev) => prev.filter((p) => p.id !== id));
        } catch (e: any) {
            alert(e?.message || "Error al eliminar");
        } finally {
            setDeletingId(null);
        }
    };

    const visibilityBadge = (vis: string) => {
        const map: Record<string, string> = { public: "green", friends: "blue", private: "gray" };
        const label: Record<string, string> = { public: "Público", friends: "Amigos", private: "Privado" };
        return <span className={`admin-badge admin-badge--${map[vis] || "gray"}`}>{label[vis] || vis}</span>;
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Moderación de Contenido</h1>
                    <p className="admin-page-subtitle">{posts.length} publicaciones en la plataforma</p>
                </div>
            </div>

            <div className="admin-filter-bar">
                <div className="admin-search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por contenido o usuario..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="admin-filter-group">
                    <Filter size={15} />
                    <select value={filterVisibility} onChange={(e) => setFilterVisibility(e.target.value)}>
                        <option value="all">Todas las visibilidades</option>
                        <option value="public">Públicas</option>
                        <option value="friends">Amigos</option>
                        <option value="private">Privadas</option>
                    </select>
                    <ChevronDown size={13} className="admin-select-arrow" />
                </div>
                <span className="admin-results-count">{filtered.length} resultados</span>
            </div>

            {loading ? (
                <div className="admin-loading"><div className="admin-spinner" /><p>Cargando publicaciones...</p></div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Autor</th>
                                <th>Contenido</th>
                                <th>Visibilidad</th>
                                <th>Interacciones</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((post) => {
                                const avatar = post.user?.profile?.avatar;
                                const avatarSrc = avatar ? (avatar.startsWith("http") ? avatar : `${BACKEND_URL}/${avatar}`) : null;
                                const imageUrl = post.imageUrl ? (post.imageUrl.startsWith("http") ? post.imageUrl : `${BACKEND_URL}/${post.imageUrl}`) : null;
                                return (
                                    <tr key={post.id}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <div className="admin-table-avatar">
                                                    {avatarSrc
                                                        ? <img src={avatarSrc} alt="avatar" />
                                                        : <span>{post.user?.profile?.firstName?.charAt(0) || "?"}</span>
                                                    }
                                                </div>
                                                <div>
                                                    <p className="admin-user-fullname">
                                                        {post.user?.profile?.firstName} {post.user?.profile?.lastName}
                                                    </p>
                                                    <p className="admin-user-uname">@{post.user?.profile?.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="admin-content-cell">
                                            <p className="admin-content-text">{post.content.substring(0, 80)}{post.content.length > 80 ? "..." : ""}</p>
                                            {imageUrl && <span className="admin-has-image"><Image size={12} /> Tiene imagen</span>}
                                        </td>
                                        <td>{visibilityBadge(post.visibility)}</td>
                                        <td>
                                            <div className="admin-interactions">
                                                <span><Heart size={12} /> {post.reactions?.length || 0}</span>
                                                <span><MessageSquare size={12} /> {post.comments?.length || 0}</span>
                                            </div>
                                        </td>
                                        <td className="admin-date-cell">
                                            {new Date(post.createdAt).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}
                                        </td>
                                        <td>
                                            <div className="admin-action-btns">
                                                <button
                                                    className="admin-btn admin-btn--icon admin-btn--ghost"
                                                    title="Vista previa"
                                                    onClick={() => setPreviewPost(post)}
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <button
                                                    className="admin-btn admin-btn--icon admin-btn--danger"
                                                    title="Eliminar"
                                                    disabled={deletingId === post.id}
                                                    onClick={() => handleDelete(post.id)}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr><td colSpan={6} className="admin-table-empty">No hay publicaciones con los filtros aplicados</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Preview modal */}
            {previewPost && (
                <div className="admin-modal-overlay" onClick={() => setPreviewPost(null)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Vista Previa del Post #{previewPost.id}</h3>
                            <button onClick={() => setPreviewPost(null)} className="admin-btn admin-btn--ghost admin-btn--sm">✕</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="admin-preview-author">
                                <strong>@{previewPost.user?.profile?.username}</strong>
                                <span>{new Date(previewPost.createdAt).toLocaleString("es")}</span>
                            </div>
                            <p className="admin-preview-content">{previewPost.content}</p>
                            {previewPost.imageUrl && (
                                <img
                                    src={previewPost.imageUrl.startsWith("http") ? previewPost.imageUrl : `${BACKEND_URL}/${previewPost.imageUrl}`}
                                    alt="post"
                                    className="admin-preview-image"
                                />
                            )}
                            <div className="admin-preview-stats">
                                <span><Heart size={14} /> {previewPost.reactions?.length || 0} reacciones</span>
                                <span><MessageSquare size={14} /> {previewPost.comments?.length || 0} comentarios</span>
                                {visibilityBadge(previewPost.visibility)}
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="admin-btn admin-btn--ghost" onClick={() => setPreviewPost(null)}>Cerrar</button>
                            <button className="admin-btn admin-btn--danger" onClick={() => { handleDelete(previewPost.id); setPreviewPost(null); }}>
                                <Trash2 size={15} /> Eliminar Post
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
