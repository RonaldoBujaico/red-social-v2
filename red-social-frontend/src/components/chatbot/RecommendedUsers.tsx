import React from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";

interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string | null;
    career?: string | null;
    cycle?: string | null;
    username: string;
    user?: {
        id: number;
    };
}

interface RecommendedUsersProps {
    students: UserProfile[];
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

export const RecommendedUsers: React.FC<RecommendedUsersProps> = ({ students }) => {
    if (!students || students.length === 0) return null;

    return (
        <div className="mt-4 p-3 rounded-2xl bg-muted/40 border border-border">
            <div className="flex items-center gap-1.5 mb-2.5">
                <Users size={14} className="text-yellow-500 shrink-0" />
                <span className="text-[11px] font-bold text-foreground">
                    Compañeros de Estudio Sugeridos
                </span>
            </div>
            <div className="space-y-2">
                {students.map((student) => {
                    const studentName = `${student.firstName} ${student.lastName}`.trim() || "Estudiante";
                    const avatar = getAvatarUrl(student.avatar, studentName);
                    const subText = `${student.career || "Estudiante"}${student.cycle ? ` • Ciclo ${student.cycle}` : ""}`;

                    // Determinar ID para enlace de perfil
                    const userId = student.user?.id || student.id;
                    const profileLink = `/users/${userId}`;

                    return (
                        <div
                            key={student.id}
                            className="flex items-center gap-2.5 p-2 rounded-xl border border-border bg-background/60 hover:border-yellow-500/20 transition-all text-xs"
                        >
                            <img
                                src={avatar}
                                alt={studentName}
                                className="w-7 h-7 rounded-full object-cover border border-border shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-[10px] text-foreground truncate max-w-[100px]">
                                    {studentName}
                                </span>
                                <span className="text-[8px] text-muted-foreground truncate max-w-[120px]">
                                    {subText}
                                </span>
                            </div>
                            <Link
                                to={profileLink}
                                className="text-[9px] text-yellow-500 hover:text-yellow-400 font-bold ml-auto shrink-0 transition-colors"
                            >
                                Perfil →
                            </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
