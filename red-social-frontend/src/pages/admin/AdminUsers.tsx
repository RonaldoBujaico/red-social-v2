import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminUsersRequest, toggleUserBanRequest, updateUserRoleRequest } from "@/api/admin.api";
import { Search, Filter, ShieldOff, ShieldCheck, Eye, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

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
        bio?: string;
    };
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL?.replace("/api", "") || "";

function getAvatar(user: AdminUser) {
    if (!user.profile?.avatar) return null;
    if (user.profile.avatar.startsWith("http")) return user.profile.avatar;
    return `${BACKEND_URL}/${user.profile.avatar}`;
}

export default function AdminUsers() {
    const { user: currentUser } = useAuthStore();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const navigate = useNavigate();

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getAdminUsersRequest();
            setUsers(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    const filtered = useMemo(() => {
        return users.filter((u) => {
            const name = `${u.profile?.firstName} ${u.profile?.lastName} ${u.profile?.username} ${u.email}`.toLowerCase();
            const matchSearch = name.includes(search.toLowerCase());
            const matchRole = filterRole === "all" || u.role === filterRole;
            const matchStatus =
                filterStatus === "all" ||
                (filterStatus === "active" && u.isActive && !u.isBanned) ||
                (filterStatus === "banned" && u.isBanned) ||
                (filterStatus === "inactive" && !u.isActive);
            return matchSearch && matchRole && matchStatus;
        });
    }, [users, search, filterRole, filterStatus]);

    const handleToggleBan = async (user: AdminUser) => {
        setActionLoading(user.id);
        try {
            await toggleUserBanRequest(user.id, !user.isBanned);
            await loadUsers();
        } catch (e: any) {
            alert(e?.message || "Error al cambiar estado de ban");
        } finally {
            setActionLoading(null);
        }
    };

    const handleRoleChange = async (user: AdminUser, role: string) => {
        setActionLoading(user.id);
        try {
            await updateUserRoleRequest(user.id, role);
            await loadUsers();
        } catch (e: any) {
            alert(e?.message || "Error al cambiar rol");
        } finally {
            setActionLoading(null);
        }
    };



    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Gestión de Usuarios</h1>
                    <p className="admin-page-subtitle">{users.length} usuarios registrados en la plataforma</p>
                </div>
            </div>

            {/* Filters */}
            <div className="admin-filter-bar">
                <div className="admin-search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, usuario o email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="admin-filter-group">
                    <Filter size={15} />
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                        <option value="all">Todos los roles</option>
                        <option value="user">Usuario</option>
                        <option value="moderator">Moderador</option>
                        <option value="admin">Admin</option>
                    </select>
                    <ChevronDown size={13} className="admin-select-arrow" />
                </div>
                <div className="admin-filter-group">
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Todos los estados</option>
                        <option value="active">Activos</option>
                        <option value="inactive">Inactivos</option>
                        <option value="banned">Baneados</option>
                    </select>
                    <ChevronDown size={13} className="admin-select-arrow" />
                </div>
                <span className="admin-results-count">{filtered.length} resultados</span>
            </div>

            {loading ? (
                <div className="admin-loading"><div className="admin-spinner" /><p>Cargando usuarios...</p></div>
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Usuario</th>
                                <th>Email</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((user) => {
                                const avatarSrc = getAvatar(user);
                                const isLoading = actionLoading === user.id;
                                return (
                                    <tr key={user.id} className={user.isBanned ? "admin-table-row--banned" : ""}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <div className="admin-table-avatar">
                                                    {avatarSrc
                                                        ? <img src={avatarSrc} alt="avatar" />
                                                        : <span>{user.profile?.firstName?.charAt(0) || "?"}</span>
                                                    }
                                                </div>
                                                <div>
                                                    <p className="admin-user-fullname">
                                                        {user.profile?.firstName} {user.profile?.lastName}
                                                    </p>
                                                    <p className="admin-user-uname">@{user.profile?.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="admin-table-email">{user.email}</td>
                                        <td>
                                            {currentUser?.role === "admin" ? (
                                                <div className="admin-filter-group admin-role-select">
                                                    <select
                                                        value={user.role}
                                                        disabled={isLoading}
                                                        onChange={(e) => handleRoleChange(user, e.target.value)}
                                                        className={`admin-role-pill admin-role-pill--${user.role}`}
                                                    >
                                                        <option value="user">Usuario</option>
                                                        <option value="moderator">Moderador</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                            ) : (
                                                <span className={`admin-role-badge admin-role-${user.role}`}>
                                                    {user.role === "admin" ? "Admin" : user.role === "moderator" ? "Moderador" : "Usuario"}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="admin-status-badges">
                                                {user.isBanned && <span className="admin-badge admin-badge--red">Baneado</span>}
                                                {!user.isBanned && user.isActive && <span className="admin-badge admin-badge--green">Activo</span>}
                                                {!user.isBanned && !user.isActive && <span className="admin-badge admin-badge--gray">Inactivo</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="admin-action-btns">
                                                <button
                                                    className="admin-btn admin-btn--icon admin-btn--ghost"
                                                    title="Ver detalle"
                                                    onClick={() => navigate(`/admin/users/${user.id}`)}
                                                >
                                                    <Eye size={15} />
                                                </button>
                                                <button
                                                    className={`admin-btn admin-btn--sm ${user.isBanned ? "admin-btn--success" : "admin-btn--danger"}`}
                                                    disabled={isLoading}
                                                    onClick={() => handleToggleBan(user)}
                                                >
                                                    {isLoading ? "..." : user.isBanned
                                                        ? <><ShieldCheck size={14} /> Desbanear</>
                                                        : <><ShieldOff size={14} /> Banear</>
                                                    }
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="admin-table-empty">
                                        No se encontraron usuarios con los filtros aplicados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
