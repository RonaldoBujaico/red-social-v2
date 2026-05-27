import { useEffect, useState } from "react";
import { Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchUsersRequest } from "@/api/user.api";
import type { User as UserType } from "@/types/auth";

const DEFAULT_AVATAR =
    "https://ui-avatars.com/api/?name=UN&background=facc15&color=000";

export default function UserSearch() {
    const navigate = useNavigate();

    const [query, setQuery] = useState("");
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const search = query.trim();

        if (!search) {
            setUsers([]);
            setShowResults(false);
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setLoading(true);

                const result = await searchUsersRequest(search);

                setUsers(result);
                setShowResults(true);
            } catch (error) {
                console.error("Error buscando usuarios", error);
            } finally {
                setLoading(false);
            }
        }, 350);

        return () => clearTimeout(timeout);
    }, [query]);

    const goToUserProfile = (id: number) => {
        setQuery("");
        setUsers([]);
        setShowResults(false);
        navigate(`/users/${id}`);
    };

    return (
        <div className="relative w-full max-w-3xl mx-auto mb-6">
            <div className="flex items-center gap-3 bg-card border border-border rounded-2xl px-5 py-3">
                <Search size={18} className="text-muted-foreground" />

                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (users.length > 0) setShowResults(true);
                    }}
                    placeholder="Buscar usuarios por nombre o username..."
                    className="w-full bg-transparent outline-none text-sm"
                />
            </div>

            {showResults && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                    {loading ? (
                        <p className="px-4 py-3 text-sm text-muted-foreground">
                            Buscando usuarios...
                        </p>
                    ) : users.length > 0 ? (
                        users.map((user) => {
                            const profile = user.profile;

                            const fullName =
                                `${profile?.firstName || ""} ${profile?.lastName || ""
                                    }`.trim() || "Usuario";

                            const username = profile?.username || "usuario";

                            const avatar =
                                profile?.avatar || DEFAULT_AVATAR;

                            return (
                                <button
                                    key={user.id}
                                    onClick={() => goToUserProfile(user.id)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition text-left"
                                >
                                    <img
                                        src={avatar}
                                        alt={fullName}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />

                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">
                                            {fullName}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            @{username}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="px-4 py-4 text-sm text-muted-foreground flex items-center gap-2">
                            <User size={16} />
                            No se encontraron usuarios.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}