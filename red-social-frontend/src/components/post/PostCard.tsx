import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Post } from "@/types/auth";
import { ThumbsUp, MessageCircle, Send, Flag } from "lucide-react";
import {
    createCommentRequest,
    toggleLikePostRequest,
} from "@/api/post.api";
import ReportModal from "@/components/ReportModal";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const DEFAULT_AVATAR =
    "https://ui-avatars.com/api/?name=UniConnect&background=facc15&color=000";

const getImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return "";

    if (imageUrl.startsWith("http")) {
        return imageUrl;
    }

    return `${BACKEND_URL}${imageUrl}`;
};

const getCommentAvatar = (avatar?: string | null, name = "Usuario") => {
    if (avatar && avatar.startsWith("http")) {
        return avatar;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        name,
    )}&background=facc15&color=000`;
};

export default function PostCard({ post }: { post: Post }) {
    const navigate = useNavigate();
    const [localPost, setLocalPost] = useState<Post>(post);
    const [liked, setLiked] = useState(false);
    const [loadingLike, setLoadingLike] = useState(false);

    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [loadingComment, setLoadingComment] = useState(false);

    const [reportTarget, setReportTarget] = useState<{
        postId?: number;
        commentId?: number;
        userId?: number;
        name: string;
    } | null>(null);

    useEffect(() => {
        setLocalPost(post);
    }, [post]);

    const likesCount = localPost.reactions?.length || 0;
    const commentsCount = localPost.comments?.length || 0;

    const avatarUrl = localPost.user?.profile?.avatar
        ? localPost.user.profile.avatar
        : DEFAULT_AVATAR;

    const handleLike = async () => {
        if (loadingLike) return;

        try {
            setLoadingLike(true);

            const result = await toggleLikePostRequest(localPost.id);

            setLiked(result.liked);
            setLocalPost(result.post);
        } catch (error) {
            console.error("Error al dar like", error);
            alert("No se pudo actualizar el like");
        } finally {
            setLoadingLike(false);
        }
    };

    const handleCreateComment = async () => {
        if (!commentText.trim() || loadingComment) return;

        try {
            setLoadingComment(true);

            const updatedPost = await createCommentRequest(
                localPost.id,
                commentText,
            );

            setLocalPost(updatedPost);
            setCommentText("");
            setShowComments(true);
        } catch (error) {
            console.error("Error al comentar", error);
            alert("No se pudo crear el comentario");
        } finally {
            setLoadingComment(false);
        }
    };

    return (
        <div className="bg-card text-foreground border border-border rounded-2xl p-4 shadow-sm transition-colors">
            <div className="flex justify-between items-start gap-3">
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(`/users/${localPost.user.id}`)}
                        className="flex-shrink-0"
                    >
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-yellow-400 transition"
                        />
                    </button>

                    <div>
                        <button
                            onClick={() => navigate(`/users/${localPost.user.id}`)}
                            className="font-semibold text-foreground hover:text-yellow-400 transition text-left"
                        >
                            {localPost.user?.profile?.username || "Usuario"}
                        </button>

                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(localPost.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setReportTarget({
                        postId: localPost.id,
                        name: `la publicación de @${localPost.user?.profile?.username || "usuario"}`
                    })}
                    className="text-muted-foreground hover:text-red-500 p-1.5 rounded-lg hover:bg-muted transition"
                    title="Reportar publicación"
                >
                    <Flag size={16} />
                </button>
            </div>

            <p className="mt-4 text-foreground">
                {localPost.content}
            </p>

            {localPost.imageUrl && (
                <div className="mt-4 w-full h-[360px] bg-muted rounded-2xl border border-border overflow-hidden flex items-center justify-center transition-colors">
                    <img
                        src={getImageUrl(localPost.imageUrl)}
                        alt="Imagen del post"
                        className="w-full h-full object-contain"
                    />
                </div>
            )}

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                    <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        👍
                    </span>
                    <span>{likesCount}</span>
                </div>

                <button
                    onClick={() => setShowComments((prev) => !prev)}
                    className="hover:underline"
                >
                    {commentsCount} comentarios
                </button>
            </div>

            <div className="mt-2 border-t border-border pt-2 flex items-center justify-around text-muted-foreground">
                <button
                    onClick={handleLike}
                    disabled={loadingLike}
                    className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg transition ${liked
                        ? "text-blue-500 font-semibold bg-blue-500/10"
                        : "hover:bg-muted hover:text-foreground"
                        }`}
                >
                    <ThumbsUp size={20} />
                    <span>{liked ? "Te gusta" : "Me gusta"}</span>
                </button>

                <button
                    onClick={() => setShowComments((prev) => !prev)}
                    className="flex items-center justify-center gap-2 w-full py-2 rounded-lg hover:bg-muted hover:text-foreground transition"
                >
                    <MessageCircle size={20} />
                    <span>Comentar</span>
                </button>
            </div>

            {showComments && (
                <div className="mt-4 border-t border-gray-300 dark:border-gray-700 pt-4">
                    <div className="flex gap-2">
                        <input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleCreateComment();
                                }
                            }}
                            placeholder="Escribe un comentario..."
                            className="flex-1 bg-muted border border-border rounded-xl px-4 py-2 outline-none text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500/50 transition"
                        />

                        <button
                            onClick={handleCreateComment}
                            disabled={loadingComment || !commentText.trim()}
                            className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-xl px-4 py-2 transition"
                        >
                            <Send size={18} />
                        </button>
                    </div>

                    <div className="mt-4 space-y-3">
                        {localPost.comments && localPost.comments.length > 0 ? (
                            localPost.comments.map((comment) => {
                                const commentProfile = comment.user?.profile;

                                const commentName =
                                    commentProfile?.username ||
                                    `${commentProfile?.firstName || ""} ${commentProfile?.lastName || ""
                                        }`.trim() ||
                                    "Usuario";

                                const commentAvatar = getCommentAvatar(
                                    commentProfile?.avatar,
                                    commentName,
                                );

                                return (
                                    <div
                                        key={comment.id}
                                        className="bg-muted rounded-xl px-4 py-3"
                                    >
                                        <div className="flex gap-3">
                                            <img
                                                src={commentAvatar}
                                                alt="Avatar comentario"
                                                className="w-9 h-9 rounded-full object-cover"
                                            />

                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h4 className="text-sm font-semibold text-foreground">
                                                            {commentName}
                                                        </h4>

                                                        {comment.createdAt && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {new Date(
                                                                    comment.createdAt,
                                                                ).toLocaleString()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={() => setReportTarget({
                                                            commentId: comment.id,
                                                            name: `el comentario de @${commentName}`
                                                        })}
                                                        className="text-muted-foreground hover:text-red-500 p-1 rounded-md hover:bg-muted transition"
                                                        title="Reportar comentario"
                                                    >
                                                        <Flag size={12} />
                                                    </button>
                                                </div>

                                                <p className="mt-1 text-sm text-foreground">
                                                    {comment.content}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Aún no hay comentarios.
                            </p>
                        )}
                    </div>
                </div>
            )}
            <ReportModal
                isOpen={reportTarget !== null}
                onClose={() => setReportTarget(null)}
                reportedPostId={reportTarget?.postId}
                reportedCommentId={reportTarget?.commentId}
                reportedUserId={reportTarget?.userId}
                reportedTargetName={reportTarget?.name}
            />
        </div>
    );
}