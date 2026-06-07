import React from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

interface Post {
    id: number;
    content: string;
    createdAt: string;
    user?: {
        profile?: {
            firstName: string;
            lastName: string;
            avatar?: string | null;
            username?: string;
        };
    };
}

interface RecommendedPostsProps {
    posts: Post[];
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
function getAvatarUrl(avatar?: string | null, name?: string) {
    if (!avatar) {
        const n = encodeURIComponent(name || "U");
        return `https://ui-avatars.com/api/?name=${n}&background=f5b800&color=000&bold=true`;
    }
    if (avatar.startsWith("http")) return avatar;
    return `${BACKEND_URL}${avatar}`;
}

export const RecommendedPosts: React.FC<RecommendedPostsProps> = ({ posts }) => {
    if (!posts || posts.length === 0) return null;

    return (
        <div className="mt-4 p-3 rounded-2xl bg-muted/40 border border-border">
            <div className="flex items-center gap-1.5 mb-2.5">
                <BookOpen size={14} className="text-yellow-500 shrink-0" />
                <span className="text-[11px] font-bold text-foreground">
                    Publicaciones Académicas Recomendadas
                </span>
            </div>
            <div className="space-y-2">
                {posts.map((post) => {
                    const authorName = `${post.user?.profile?.firstName || ""} ${post.user?.profile?.lastName || ""}`.trim() || "Estudiante";
                    const avatar = getAvatarUrl(post.user?.profile?.avatar, authorName);
                    const snippet = post.content.length > 70 ? post.content.substring(0, 70) + "..." : post.content;

                    return (
                        <div
                            key={post.id}
                            className="flex flex-col p-2.5 rounded-xl border border-border bg-background/60 hover:border-yellow-500/20 transition-all text-xs"
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <img
                                    src={avatar}
                                    alt={authorName}
                                    className="w-5 h-5 rounded-full object-cover border border-border shrink-0"
                                />
                                <span className="font-semibold text-[10px] text-foreground truncate max-w-[80px]">
                                    {authorName}
                                </span>
                                <span className="text-[8px] text-muted-foreground ml-auto">
                                    ID: #{post.id}
                                </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                                {snippet}
                            </p>
                            <Link
                                to="/home"
                                className="text-[9px] text-yellow-500 hover:text-yellow-400 font-bold self-end mt-1.5 transition-colors"
                            >
                                Ver en Muro →
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
