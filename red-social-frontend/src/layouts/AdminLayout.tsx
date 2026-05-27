import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import ThemeButton from "@/components/buttons/ThemeButton";
import {
    LayoutDashboard,
    Users,
    Flag,
    FileText,
    Settings,
    Activity,
    BarChart3,
    LogOut,
    ShieldCheck,
    ChevronRight,
    Bell,
} from "lucide-react";

const navItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/admin/users", label: "Usuarios", icon: Users },
    { to: "/admin/reports", label: "Reportes", icon: Flag },
    { to: "/admin/content", label: "Contenido", icon: FileText },
    { to: "/admin/stats", label: "Estadísticas", icon: BarChart3 },
    { to: "/admin/audit", label: "Auditoría", icon: Activity },
    { to: "/admin/config", label: "Configuración", icon: Settings },
];

export default function AdminLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const fullName =
        `${user?.profile?.firstName || ""} ${user?.profile?.lastName || ""}`.trim() || 
        (user?.role === "admin" ? "Administrador" : "Moderador");
    const username = user?.profile?.username || (user?.role === "admin" ? "admin" : "moderador");

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const filteredNavItems = navItems
        .filter((item) => {
            if (user?.role === "moderator") {
                // Ocultar estadísticas generales de la plataforma al moderador
                return item.to !== "/admin/stats";
            }
            return true;
        })
        .map((item) => {
            if (user?.role === "moderator") {
                if (item.to === "/admin") return { ...item, label: "Resumen Moderación" };
                if (item.to === "/admin/users") return { ...item, label: "Lista de Usuarios" };
                if (item.to === "/admin/reports") return { ...item, label: "Reportes Recibidos" };
                if (item.to === "/admin/content") return { ...item, label: "Moderación Contenido" };
                if (item.to === "/admin/audit") return { ...item, label: "Historial de Acciones" };
                if (item.to === "/admin/config") return { ...item, label: "Conf. Moderación" };
            }
            return item;
        });

    return (
        <div className="admin-shell">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <div className="admin-logo">
                        <ShieldCheck size={22} className="admin-logo-icon" />
                        <span>{user?.role === "admin" ? "Admin Panel" : "Panel Moderación"}</span>
                    </div>
                    <p className="admin-app-name">UniConnect</p>
                </div>

                <div className="admin-user-card">
                    <div className="admin-user-avatar">
                        {user?.profile?.avatar ? (
                            <img src={user.profile.avatar} alt="avatar" />
                        ) : (
                            <span>{fullName.charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="admin-user-info">
                        <p className="admin-user-name">{fullName}</p>
                        <p className="admin-user-username">@{username}</p>
                        <span className={`admin-role-badge admin-role-${user?.role}`}>
                            {user?.role === "admin" ? "Administrador" : "Moderador"}
                        </span>
                    </div>
                </div>

                <nav className="admin-nav">
                    {filteredNavItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `admin-nav-item ${isActive ? "admin-nav-item--active" : ""}`
                            }
                        >
                            <item.icon size={18} className="admin-nav-icon" />
                            <span>{item.label}</span>
                            <ChevronRight size={14} className="admin-nav-chevron" />
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <NavLink to="/home" className="admin-nav-item admin-nav-item--secondary">
                        <Bell size={18} className="admin-nav-icon" />
                        <span>Ir a la App</span>
                    </NavLink>
                    <button onClick={handleLogout} className="admin-logout-btn">
                        <LogOut size={18} />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="admin-main">
                <Outlet />
            </main>

            {/* Theme toggle floating button */}
            <div className="fixed bottom-6 right-6 z-[999]">
                <ThemeButton />
            </div>
        </div>
    );
}
