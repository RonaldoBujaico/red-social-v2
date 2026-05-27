import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAdminUsersRequest, toggleUserBanRequest, updateUserRoleRequest } from "@/api/admin.api";
import {
    ArrowLeft, Mail, User, Crown, Shield, ShieldOff, ShieldCheck,
    Calendar, VenetianMask, FileText, AtSign
} from "lucide-react";

interface AdminUser {
    id: number;
    email: string;
    role: "user" | "admin" | "moderator";
    isActive: boolean;
    isBanned: boolean;
    profile: {
        firstName: string;
        lastName: string;
        username: string;
        avatar: string;
        coverImage?: string;
        bio?: string;
        birthDate?: string;
        gender?: string;
    };
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace("/api", "") || "";

function resolveUrl(url: string | undefined) {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${BACKEND_URL}/${url}`;
}

export default function AdminUserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState("");

    const loadUser = async () => {
        setLoading(true);
        const all = await getAdminUsersRequest();
        const found = all.find((u: AdminUser) => u.id === Number(id));
        setUser(found || null);
        setSelectedRole(found?.role || "user");
        setLoading(false);
    };

    useEffect(() => { loadUser(); }, [id]);

    const handleBanToggle = async () => {
        if (!user) return;
        setActionLoading(true);
        try {
            await toggleUserBanRequest(user.id, !user.isBanned);
            await loadUser();
        } catch (e: any) {
            alert(e?.message || "Error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleRoleUpdate = async () => {
        if (!user) return;
        setActionLoading(true);
        try {
            await updateUserRoleRequest(user.id, selectedRole);
            await loadUser();
        } catch (e: any) {
            alert(e?.message || "Error");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <div className="admin-page">
            <div className="admin-loading"><div className="admin-spinner" /><p>Cargando usuario...</p></div>
        </div>
    );
    if (!user) return (
        <div className="admin-page">
            <p className="admin-empty-msg">Usuario no encontrado</p>
        </div>
    );

    const avatarSrc = resolveUrl(user.profile?.avatar);
    const coverSrc = resolveUrl(user.profile?.coverImage);

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => navigate("/admin/users")}>
                    <ArrowLeft size={16} /> Volver a Usuarios
                </button>
            </div>

            <div className="admin-detail-layout">
                {/* Profile card */}
                <div className="admin-detail-card">
                    <div className="admin-detail-cover">
                        {coverSrc
                            ? <img src={coverSrc} alt="cover" />
                            : <div className="admin-detail-cover-placeholder" />
                        }
                        <div className="admin-detail-avatar-wrap">
                            {avatarSrc
                                ? <img src={avatarSrc} alt="avatar" className="admin-detail-avatar" />
                                : <div className="admin-detail-avatar admin-detail-avatar--fallback">
                                    {user.profile?.firstName?.charAt(0) || "?"}
                                </div>
                            }
                        </div>
                    </div>
                    <div className="admin-detail-profile-info">
                        <h2 className="admin-detail-name">
                            {user.profile?.firstName} {user.profile?.lastName}
                        </h2>
                        <p className="admin-detail-username">@{user.profile?.username}</p>
                        {user.profile?.bio && (
                            <p className="admin-detail-bio">{user.profile.bio}</p>
                        )}
                        <div className="admin-detail-badges">
                            <span className={`admin-badge admin-badge--${user.role === "admin" ? "gold" : user.role === "moderator" ? "violet" : "blue"}`}>
                                {user.role === "admin" ? <Crown size={12} /> : user.role === "moderator" ? <Shield size={12} /> : <User size={12} />}
                                {user.role}
                            </span>
                            {user.isBanned && <span className="admin-badge admin-badge--red">Baneado</span>}
                            {!user.isBanned && user.isActive && <span className="admin-badge admin-badge--green">Activo</span>}
                            {!user.isBanned && !user.isActive && <span className="admin-badge admin-badge--gray">Inactivo</span>}
                        </div>
                    </div>
                </div>

                <div className="admin-detail-right">
                    {/* Info fields */}
                    <div className="admin-info-card">
                        <h3 className="admin-info-card-title">Información del Usuario</h3>
                        <div className="admin-info-fields">
                            <div className="admin-info-field">
                                <Mail size={15} /><span className="admin-info-label">Email</span>
                                <span className="admin-info-value">{user.email}</span>
                            </div>
                            <div className="admin-info-field">
                                <AtSign size={15} /><span className="admin-info-label">Username</span>
                                <span className="admin-info-value">@{user.profile?.username}</span>
                            </div>
                            <div className="admin-info-field">
                                <FileText size={15} /><span className="admin-info-label">ID</span>
                                <span className="admin-info-value">#{user.id}</span>
                            </div>
                            {user.profile?.birthDate && (
                                <div className="admin-info-field">
                                    <Calendar size={15} /><span className="admin-info-label">Nacimiento</span>
                                    <span className="admin-info-value">
                                        {new Date(user.profile.birthDate).toLocaleDateString("es")}
                                    </span>
                                </div>
                            )}
                            {user.profile?.gender && (
                                <div className="admin-info-field">
                                    <VenetianMask size={15} /><span className="admin-info-label">Género</span>
                                    <span className="admin-info-value">{user.profile.gender}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="admin-info-card">
                        <h3 className="admin-info-card-title">Acciones de Moderación</h3>

                        <div className="admin-action-section">
                            <label className="admin-action-label">Cambiar Rol</label>
                            <div className="admin-action-row">
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="admin-select"
                                    disabled={actionLoading}
                                >
                                    <option value="user">Usuario</option>
                                    <option value="moderator">Moderador</option>
                                    <option value="admin">Administrador</option>
                                </select>
                                <button
                                    className="admin-btn admin-btn--primary admin-btn--sm"
                                    onClick={handleRoleUpdate}
                                    disabled={actionLoading || selectedRole === user.role}
                                >
                                    Guardar Rol
                                </button>
                            </div>
                        </div>

                        <div className="admin-action-section">
                            <label className="admin-action-label">Estado de Acceso</label>
                            <button
                                className={`admin-btn ${user.isBanned ? "admin-btn--success" : "admin-btn--danger"}`}
                                onClick={handleBanToggle}
                                disabled={actionLoading}
                            >
                                {actionLoading ? "Procesando..." : user.isBanned
                                    ? <><ShieldCheck size={16} /> Quitar suspensión</>
                                    : <><ShieldOff size={16} /> Suspender usuario</>
                                }
                            </button>
                            <p className="admin-action-hint">
                                {user.isBanned
                                    ? "El usuario está actualmente suspendido y no puede acceder a la plataforma."
                                    : "El usuario tiene acceso completo a la plataforma."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
