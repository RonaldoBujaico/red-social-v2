import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, MapPin, Search, UserCheck, Sparkles } from "lucide-react";

interface StudentCard {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    avatar?: string | null;
    career?: string | null;
    university?: string | null;
    faculty?: string | null;
    academic_cycle?: string | null;
    cycle?: string | null;
    country?: string | null;
    department?: string | null;
    province?: string | null;
    district?: string | null;
    interests?: { id: number; interestName: string }[];
    skills?: { id: number; skillName: string }[];
    user?: { id: number };
}

interface SearchedUsersProps {
    students: StudentCard[];
    /** Criterio de búsqueda para mostrar como título */
    criteria?: string;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function getAvatarUrl(avatar?: string | null, name?: string): string {
    if (!avatar) {
        const n = encodeURIComponent(name || "U");
        return `https://ui-avatars.com/api/?name=${n}&background=f5b800&color=000&bold=true&size=64`;
    }
    if (avatar.startsWith("http")) return avatar;
    return `${BACKEND_URL}${avatar}`;
}

export const SearchedUsers: React.FC<SearchedUsersProps> = ({ students, criteria }) => {
    if (!students || students.length === 0) return null;

    return (
        <div className="mt-3 space-y-2">
            {/* Cabecera del panel */}
            <div className="flex items-center gap-2 px-1">
                <Search size={13} className="text-yellow-500 shrink-0" />
                <span className="text-[11px] font-bold text-foreground uppercase tracking-wide">
                    {students.length} resultado{students.length > 1 ? "s" : ""}
                    {criteria ? ` para "${criteria}"` : ""}
                </span>
            </div>

            {/* Tarjetas de estudiantes */}
            {students.map((student) => {
                const fullName = `${student.firstName} ${student.lastName}`.trim() || "Estudiante";
                const avatar   = getAvatarUrl(student.avatar, fullName);
                const userId   = student.user?.id ?? student.id;
                const cycle    = student.academic_cycle ?? student.cycle;
                const location = [student.district, student.department, student.country]
                    .filter(Boolean)
                    .join(", ");

                return (
                    <div
                        key={student.id}
                        className="bg-background border border-border rounded-2xl p-3 hover:border-yellow-500/30 hover:shadow-md hover:shadow-yellow-500/5 transition-all"
                    >
                        {/* Fila superior: avatar + datos + botón */}
                        <div className="flex items-center gap-2.5">
                            <img
                                src={avatar}
                                alt={fullName}
                                className="w-9 h-9 rounded-xl object-cover border border-border shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-extrabold text-foreground truncate">
                                    {fullName}
                                </p>
                                <p className="text-[9px] text-muted-foreground truncate">
                                    @{student.username}
                                </p>
                            </div>

                            <Link
                                to={`/users/${userId}`}
                                className="shrink-0 flex items-center gap-1 bg-yellow-500 hover:bg-yellow-400 text-black text-[9px] font-bold px-2.5 py-1.5 rounded-xl transition-all shadow-sm shadow-yellow-500/20 hover:shadow-yellow-500/30"
                                aria-label={`Ver perfil de ${fullName}`}
                            >
                                <UserCheck size={10} aria-hidden="true" />
                                Ver Perfil
                            </Link>
                        </div>

                        {/* Fila de datos académicos */}
                        <div className="mt-2 space-y-0.5 pl-0.5">
                            {/* Carrera + universidad */}
                            {(student.career || student.university) && (
                                <div className="flex items-start gap-1 text-[9px] text-muted-foreground">
                                    <GraduationCap size={10} className="text-yellow-500 mt-0.5 shrink-0" />
                                    <span className="truncate">
                                        {[student.career, student.university, cycle ? `Ciclo ${cycle}` : null]
                                            .filter(Boolean)
                                            .join(" · ")}
                                    </span>
                                </div>
                            )}

                            {/* Ubicación */}
                            {location && (
                                <div className="flex items-start gap-1 text-[9px] text-muted-foreground">
                                    <MapPin size={10} className="text-yellow-500 mt-0.5 shrink-0" />
                                    <span className="truncate">{location}</span>
                                </div>
                            )}
                        </div>

                        {/* Chips de intereses */}
                        {student.interests && student.interests.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                <Sparkles size={9} className="text-yellow-500 mt-0.5 shrink-0" />
                                {student.interests.slice(0, 4).map((interest) => (
                                    <span
                                        key={interest.id}
                                        className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-md text-[8px] font-semibold"
                                    >
                                        {interest.interestName}
                                    </span>
                                ))}
                                {student.interests.length > 4 && (
                                    <span className="text-[8px] text-muted-foreground self-center">
                                        +{student.interests.length - 4} más
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
