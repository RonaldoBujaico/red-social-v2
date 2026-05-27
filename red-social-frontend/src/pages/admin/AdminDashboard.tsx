import { useEffect, useState } from "react";
import { getAdminStatsRequest } from "@/api/admin.api";
import {
    Users, FileText, Flag, MessageSquare,
    TrendingUp, ShieldOff, Clock, CheckCircle,
    UserCheck, Crown, Shield
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

interface Stats {
    users: { total: number; active: number; banned: number; admins: number; moderators: number; regular: number };
    posts: { total: number };
    reports: { total: number; pending: number; resolved: number; dismissed: number };
    comments: { total: number };
}

function StatCard({ label, value, icon: Icon, color, sub }: {
    label: string; value: number | string; icon: any; color: string; sub?: string;
}) {
    return (
        <div className={`admin-stat-card admin-stat-card--${color}`}>
            <div className="admin-stat-icon-wrap">
                <Icon size={22} />
            </div>
            <div className="admin-stat-body">
                <p className="admin-stat-label">{label}</p>
                <p className="admin-stat-value">{value}</p>
                {sub && <p className="admin-stat-sub">{sub}</p>}
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminStatsRequest()
            .then(setStats)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-loading">
                    <div className="admin-spinner" />
                    <p>Cargando estadísticas...</p>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const reportResolutionRate = stats.reports.total > 0
        ? Math.round(((stats.reports.resolved + stats.reports.dismissed) / stats.reports.total) * 100)
        : 0;

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">
                        {user?.role === "admin" ? "Dashboard General" : "Panel de Moderación"}
                    </h1>
                    <p className="admin-page-subtitle">
                        {user?.role === "admin"
                            ? "Resumen general de la plataforma UniConnect"
                            : "Resumen de reportes y acciones de contenido"}
                    </p>
                </div>
                <span className="admin-live-badge">
                    <span className="admin-live-dot" /> En vivo
                </span>
            </div>

            {/* Main stats */}
            <div className="admin-stats-grid">
                <StatCard label="Total Usuarios" value={stats.users.total} icon={Users} color="blue" sub={`${stats.users.active} activos`} />
                <StatCard label="Publicaciones" value={stats.posts.total} icon={FileText} color="purple" />
                <StatCard label="Reportes Pendientes" value={stats.reports.pending} icon={Flag} color="orange" sub={`${stats.reports.total} total`} />
                <StatCard label="Comentarios" value={stats.comments.total} icon={MessageSquare} color="green" />
            </div>

            {/* Secondary stats */}
            <div className="admin-stats-grid admin-stats-grid--sm">
                <StatCard label="Usuarios Activos" value={stats.users.active} icon={UserCheck} color="teal" />
                <StatCard label="Usuarios Baneados" value={stats.users.banned} icon={ShieldOff} color="red" />
                <StatCard label="Administradores" value={stats.users.admins} icon={Crown} color="gold" />
                <StatCard label="Moderadores" value={stats.users.moderators} icon={Shield} color="violet" />
                <StatCard label="Reportes Resueltos" value={stats.reports.resolved} icon={CheckCircle} color="green" />
                <StatCard label="Reportes Descartados" value={stats.reports.dismissed} icon={Clock} color="gray" />
            </div>

            {/* Summary cards */}
            <div className="admin-summary-row">
                <div className="admin-summary-card">
                    <h3 className="admin-summary-title">
                        <TrendingUp size={18} /> Distribución de Roles
                    </h3>
                    <div className="admin-role-bars">
                        {[
                            { label: "Usuarios", count: stats.users.regular, total: stats.users.total, color: "#6366f1" },
                            { label: "Moderadores", count: stats.users.moderators, total: stats.users.total, color: "#f59e0b" },
                            { label: "Admins", count: stats.users.admins, total: stats.users.total, color: "#ef4444" },
                        ].map(({ label, count, total, color }) => (
                            <div key={label} className="admin-role-bar-item">
                                <div className="admin-role-bar-header">
                                    <span>{label}</span>
                                    <span>{count}</span>
                                </div>
                                <div className="admin-role-bar-track">
                                    <div
                                        className="admin-role-bar-fill"
                                        style={{ width: `${total > 0 ? (count / total) * 100 : 0}%`, background: color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="admin-summary-card">
                    <h3 className="admin-summary-title">
                        <Flag size={18} /> Estado de Reportes
                    </h3>
                    <div className="admin-report-donuts">
                        <div className="admin-donut-stat">
                            <div className="admin-donut-circle admin-donut-circle--orange">
                                <span>{stats.reports.pending}</span>
                            </div>
                            <p>Pendientes</p>
                        </div>
                        <div className="admin-donut-stat">
                            <div className="admin-donut-circle admin-donut-circle--green">
                                <span>{stats.reports.resolved}</span>
                            </div>
                            <p>Resueltos</p>
                        </div>
                        <div className="admin-donut-stat">
                            <div className="admin-donut-circle admin-donut-circle--gray">
                                <span>{stats.reports.dismissed}</span>
                            </div>
                            <p>Descartados</p>
                        </div>
                    </div>
                    <div className="admin-resolution-rate">
                        <span>Tasa de resolución</span>
                        <strong>{reportResolutionRate}%</strong>
                    </div>
                    <div className="admin-progress-bar-track">
                        <div className="admin-progress-bar-fill" style={{ width: `${reportResolutionRate}%` }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
