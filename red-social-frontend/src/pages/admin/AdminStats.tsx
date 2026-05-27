import { useEffect, useState } from "react";
import { getAdminStatsRequest } from "@/api/admin.api";
import { BarChart3, Users, FileText, Flag, MessageSquare, TrendingUp } from "lucide-react";

interface Stats {
    users: { total: number; active: number; banned: number; admins: number; moderators: number; regular: number };
    posts: { total: number };
    reports: { total: number; pending: number; resolved: number; dismissed: number };
    comments: { total: number };
}

function ProgressBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="admin-stats-bar-item">
            <div className="admin-stats-bar-header">
                <span className="admin-stats-bar-label">{label}</span>
                <span className="admin-stats-bar-value">{value}</span>
            </div>
            <div className="admin-progress-bar-track">
                <div className="admin-progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="admin-stats-bar-pct">{pct.toFixed(1)}%</span>
        </div>
    );
}

function BigNumber({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
    return (
        <div className="admin-big-number" style={{ borderColor: color }}>
            <Icon size={28} style={{ color }} />
            <div className="admin-big-number-val">{value.toLocaleString()}</div>
            <div className="admin-big-number-label">{label}</div>
        </div>
    );
}

export default function AdminStats() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminStatsRequest().then(setStats).finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="admin-page">
            <div className="admin-loading"><div className="admin-spinner" /><p>Cargando estadísticas...</p></div>
        </div>
    );
    if (!stats) return null;

    const engagementRate = stats.posts.total > 0
        ? ((stats.comments.total / stats.posts.total)).toFixed(2)
        : "0";

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Estadísticas Avanzadas</h1>
                    <p className="admin-page-subtitle">Métricas detalladas de la plataforma UniConnect</p>
                </div>
            </div>

            {/* Big numbers */}
            <div className="admin-big-numbers-grid">
                <BigNumber label="Usuarios Totales" value={stats.users.total} icon={Users} color="#6366f1" />
                <BigNumber label="Publicaciones" value={stats.posts.total} icon={FileText} color="#8b5cf6" />
                <BigNumber label="Comentarios" value={stats.comments.total} icon={MessageSquare} color="#10b981" />
                <BigNumber label="Reportes" value={stats.reports.total} icon={Flag} color="#f59e0b" />
            </div>

            <div className="admin-stats-sections">
                {/* User stats */}
                <div className="admin-stats-section-card">
                    <h3 className="admin-section-card-title"><Users size={18} /> Estadísticas de Usuarios</h3>
                    <div className="admin-stats-bars">
                        <ProgressBar label="Usuarios Activos" value={stats.users.active} max={stats.users.total} color="#10b981" />
                        <ProgressBar label="Usuarios Inactivos" value={stats.users.total - stats.users.active} max={stats.users.total} color="#6b7280" />
                        <ProgressBar label="Usuarios Baneados" value={stats.users.banned} max={stats.users.total} color="#ef4444" />
                        <ProgressBar label="Administradores" value={stats.users.admins} max={stats.users.total} color="#f59e0b" />
                        <ProgressBar label="Moderadores" value={stats.users.moderators} max={stats.users.total} color="#8b5cf6" />
                        <ProgressBar label="Usuarios Regulares" value={stats.users.regular} max={stats.users.total} color="#6366f1" />
                    </div>
                </div>

                {/* Report stats */}
                <div className="admin-stats-section-card">
                    <h3 className="admin-section-card-title"><Flag size={18} /> Estadísticas de Reportes</h3>
                    <div className="admin-stats-bars">
                        <ProgressBar label="Pendientes" value={stats.reports.pending} max={stats.reports.total} color="#f59e0b" />
                        <ProgressBar label="Resueltos" value={stats.reports.resolved} max={stats.reports.total} color="#10b981" />
                        <ProgressBar label="Descartados" value={stats.reports.dismissed} max={stats.reports.total} color="#6b7280" />
                    </div>

                    <div className="admin-metric-highlight">
                        <TrendingUp size={16} />
                        <span>Tasa de resolución:</span>
                        <strong>
                            {stats.reports.total > 0
                                ? `${Math.round(((stats.reports.resolved + stats.reports.dismissed) / stats.reports.total) * 100)}%`
                                : "N/A"}
                        </strong>
                    </div>
                </div>

                {/* Engagement */}
                <div className="admin-stats-section-card">
                    <h3 className="admin-section-card-title"><BarChart3 size={18} /> Métricas de Engagement</h3>
                    <div className="admin-metric-list">
                        <div className="admin-metric-item">
                            <span>Promedio comentarios por post</span>
                            <strong>{engagementRate}</strong>
                        </div>
                        <div className="admin-metric-item">
                            <span>Posts por usuario (promedio)</span>
                            <strong>{stats.users.total > 0 ? (stats.posts.total / stats.users.total).toFixed(2) : "0"}</strong>
                        </div>
                        <div className="admin-metric-item">
                            <span>Reportes por usuario (promedio)</span>
                            <strong>{stats.users.total > 0 ? (stats.reports.total / stats.users.total).toFixed(3) : "0"}</strong>
                        </div>
                        <div className="admin-metric-item">
                            <span>% usuarios activos</span>
                            <strong>{stats.users.total > 0 ? `${Math.round((stats.users.active / stats.users.total) * 100)}%` : "0%"}</strong>
                        </div>
                        <div className="admin-metric-item">
                            <span>% usuarios baneados</span>
                            <strong>{stats.users.total > 0 ? `${Math.round((stats.users.banned / stats.users.total) * 100)}%` : "0%"}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
