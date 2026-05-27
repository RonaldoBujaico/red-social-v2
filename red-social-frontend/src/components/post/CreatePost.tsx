import { useAuthStore } from "@/store/auth.store";
import { useState } from "react";
import { ImageIcon, X, Send } from "lucide-react";

interface Props {
    onCreate: (content: string, image?: File | null) => Promise<void>;
}

export default function CreatePost({ onCreate }: Props) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [focused, setFocused] = useState(false);

    const { user } = useAuthStore();

    const handleSubmit = async () => {
        if (!content.trim() && !image) return;

        try {
            setLoading(true);
            await onCreate(content, image);
            setContent("");
            setImage(null);
            setPreview(null);
            setFocused(false);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreview(null);
    };

    const canPost = (content.trim().length > 0 || image !== null) && !loading;

    return (
        <div className={`bg-card border rounded-2xl p-4 shadow-sm transition-all duration-200 ${
            focused ? "border-yellow-500/60 shadow-yellow-500/10 shadow-md" : "border-border"
        }`}>
            <div className="flex gap-3">
                {/* Avatar */}
                <img
                    src={user?.profile?.avatar ?? "https://ui-avatars.com/api/?name=U&background=f5b800&color=000"}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-border"
                    alt="Avatar"
                />

                <div className="flex-1 min-w-0">
                    {/* Textarea */}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="¿Qué tienes en mente?"
                        className="w-full bg-muted border border-border text-foreground placeholder:text-muted-foreground rounded-xl px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500/60 transition-all text-sm leading-relaxed"
                        rows={focused || content ? 4 : 2}
                    />

                    {/* Image preview */}
                    {preview && (
                        <div className="mt-3 relative w-full rounded-xl overflow-hidden border border-border bg-muted">
                            <img
                                src={preview}
                                alt="Vista previa"
                                className="w-full max-h-64 object-contain"
                            />
                            <button
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition backdrop-blur-sm"
                                title="Quitar imagen"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Actions bar */}
                    <div className="flex items-center justify-between mt-3 gap-2">
                        {/* Left: image button */}
                        <label className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                            image
                                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400"
                                : "bg-muted border-border text-muted-foreground hover:text-foreground hover:border-yellow-500/30 hover:bg-yellow-500/5"
                        }`}>
                            <ImageIcon size={16} />
                            <span className="hidden sm:inline">{image ? "Cambiar imagen" : "Imagen"}</span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setImage(file);
                                    setPreview(URL.createObjectURL(file));
                                }}
                            />
                        </label>

                        {/* Right: char count + post button */}
                        <div className="flex items-center gap-3">
                            {content.length > 0 && (
                                <span className={`text-xs font-mono ${
                                    content.length > 450
                                        ? "text-red-400"
                                        : content.length > 350
                                            ? "text-yellow-400"
                                            : "text-muted-foreground"
                                }`}>
                                    {content.length}/500
                                </span>
                            )}
                            <button
                                onClick={handleSubmit}
                                disabled={!canPost}
                                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-yellow-500/20 active:scale-95 text-sm"
                            >
                                <Send size={15} />
                                <span>{loading ? "Publicando..." : "Publicar"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}