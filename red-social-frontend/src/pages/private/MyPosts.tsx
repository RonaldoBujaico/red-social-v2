import { useEffect, useState } from "react";
import {
    getMyPostsRequest,
    deletePostRequest,
    updatePostVisibilityRequest,
    updatePostRequest,
} from "@/api/post.api";

type PostType = {
    id: number;
    content: string;
    visibility: "public" | "friends" | "private";
    createdAt: string;
};

const MyPosts = () => {
    const [posts, setPosts] = useState<PostType[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const data = await getMyPostsRequest();
            setPosts(data);
        } catch (err) {
            console.error("Error cargando posts");
        } finally {
            setLoading(false);
        }
    };
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState("");
    useEffect(() => {
        fetchPosts();
    }, []);

    const handleUpdate = async (id: number) => {
        if (!editContent.trim()) return;

        try {
            await updatePostRequest(id, { content: editContent });

            setPosts((prev) =>
                prev.map((p) =>
                    p.id === id ? { ...p, content: editContent } : p,
                ),
            );

            setEditingId(null);
            setEditContent("");
        } catch {
            alert("Error al actualizar");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar este post?")) return;

        try {
            await deletePostRequest(id);
            setPosts((prev) => prev.filter((p) => p.id !== id));
        } catch {
            alert("Error al eliminar");
        }
    };

    const handleVisibility = async (
        id: number,
        visibility: "public" | "friends" | "private",
    ) => {
        try {
            await updatePostVisibilityRequest(id, visibility);

            setPosts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, visibility } : p)),
            );
        } catch {
            alert("Error al actualizar visibilidad");
        }
    };

    if (loading) return <p>Cargando...</p>;

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-center text-2xl font-semibold pb-4 text-foreground">
                Mis Publicaciones
            </h1>

            {posts.map((post) => (
                <div
                    key={post.id}
                    className="bg-card border border-border p-4 rounded-xl shadow"
                >
                    {editingId === post.id ? (
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full border rounded p-2 mb-2 bg-background text-foreground"
                        />
                    ) : (
                        <p className="mb-2 text-foreground">{post.content}</p>
                    )}
                    <p className="text-sm text-muted-foreground text-foreground mb-3">
                        {post.visibility}
                    </p>

                    <div className="flex gap-2 flex-wrap">
                        <select
                            value={post.visibility}
                            onChange={(e) =>
                                handleVisibility(post.id, e.target.value as any)
                            }
                            className="border rounded px-2 py-1 bg-background  text-foreground"
                        >
                            <option value="public">Público</option>
                            <option value="friends">Amigos</option>
                            <option value="private">Privado</option>
                        </select>

                        {editingId === post.id ? (
                            <>
                                <button
                                    onClick={() => handleUpdate(post.id)}
                                    className="px-3 py-1 bg-green-500  text-foreground rounded"
                                >
                                    Guardar
                                </button>

                                <button
                                    onClick={() => {
                                        setEditingId(null);
                                        setEditContent("");
                                    }}
                                    className="px-3 py-1 bg-gray-500 text-foreground rounded"
                                >
                                    Cancelar
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => {
                                    setEditingId(post.id);
                                    setEditContent(post.content);
                                }}
                                className="px-3 py-1 bg-blue-500 text-foreground rounded"
                            >
                                Editar
                            </button>
                        )}
                        <button
                            onClick={() => handleDelete(post.id)}
                            className="px-3 py-1 bg-red-600 text-foreground rounded ml-auto"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyPosts;
