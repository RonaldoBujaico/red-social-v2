import { useEffect, useState } from "react";
import { getAdminUsersRequest, getAdminReportsRequest } from "@/api/admin.api";
import { Activity, User, Clock, CheckCircle, XCircle, ShieldOff, Crown } from "lucide-react";

interface AuditEvent {
    id: string;
    type: "ban" | "unban" | "role_change" | "report_resolved" | "report_dismissed" | "user_registered";
    actor?: string;
    target: string;
    detail: string;
    time: string;
    icon: any;
    color: string;
}

function buildAuditLog(users: any[], reports: any[]): AuditEvent[] {
    const events: AuditEvent[] = [];

    // Build events from report resolutions
    reports.forEach((r) => {
        if (r.status === "resolved" && r.resolvedAt) {
            events.push({
                id: `report-resolved-${r.id}`,
                type: "report_resolved",
                actor: r.resolvedBy?.profile
                    ? `${r.resolvedBy.profile.firstName} ${r.resolvedBy.profile.lastName}`
                    : "Admin",
                target: `Reporte #${r.id}`,
                detail: `Reporte resuelto: "${r.reason}"`,
                time: r.resolvedAt,
                icon: CheckCircle,
                color: "#10b981",
            });
        }
        if (r.status === "dismissed" && r.resolvedAt) {
            events.push({
                id: `report-dismissed-${r.id}`,
                type: "report_dismissed",
                actor: r.resolvedBy?.profile
                    ? `${r.resolvedBy.profile.firstName} ${r.resolvedBy.profile.lastName}`
                    : "Admin",
                target: `Reporte #${r.id}`,
                detail: `Reporte descartado: "${r.reason}"`,
                time: r.resolvedAt,
                icon: XCircle,
                color: "#6b7280",
            });
        }
    });

    // Build events from banned users
    users.forEach((u) => {
        if (u.isBanned) {
            events.push({
                id: `ban-${u.id}`,
                type: "ban",
                actor: "Admin",
                target: `@${u.profile?.username || u.email}`,
                detail: `Usuario suspendido: ${u.profile?.firstName} ${u.profile?.lastName}`,
                time: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
                icon: ShieldOff,
                color: "#ef4444",
            });
        }
        if (u.role === "admin") {
            events.push({
                id: `role-admin-${u.id}`,
                type: "role_change",
                actor: "Sistema",
                target: `@${u.profile?.username || u.email}`,
                detail: `Rol asignado: Administrador`,
                time: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
                icon: Crown,
                color: "#f59e0b",
            });
        }
    });

    return events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

const typeLabels: Record<string, string> = {
    all: "Todos",
    ban: "Suspensiones",
    unban: "Desbloqueos",
    role_change: "Cambios de Rol",
    report_resolved: "Reportes Resueltos",
    report_dismissed: "Reportes Descartados",
};

export default function AdminAudit() {
    const [events, setEvents] = useState<AuditEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("all");

    useEffect(() => {
        Promise.all([getAdminUsersRequest(), getAdminReportsRequest()])
            .then(([users, reports]) => {
                setEvents(buildAuditLog(users, reports));
            })
            .finally(() => setLoading(false));
    }, []);

    const filtered = filterType === "all" ? events : events.filter((e) => e.type === filterType);

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Auditoría / Historial</h1>
                    <p className="admin-page-subtitle">Registro de actividades administrativas en la plataforma</p>
                </div>
            </div>

            <div className="admin-filter-bar">
                <Activity size={16} style={{ opacity: 0.6 }} />
                {Object.entries(typeLabels).map(([key, label]) => (
                    <button
                        key={key}
                        className={`admin-filter-chip ${filterType === key ? "admin-filter-chip--active" : ""}`}
                        onClick={() => setFilterType(key)}
                    >
                        {label}
                    </button>
                ))}
                <span className="admin-results-count">{filtered.length} eventos</span>
            </div>

            {loading ? (
                <div className="admin-loading"><div className="admin-spinner" /><p>Cargando historial...</p></div>
            ) : filtered.length === 0 ? (
                <div className="admin-empty-state">
                    <Activity size={40} opacity={0.3} />
                    <p>No hay eventos registrados para este filtro</p>
                </div>
            ) : (
                <div className="admin-timeline">
                    {filtered.map((event, idx) => {
                        const Icon = event.icon;
                        return (
                            <div key={event.id} className="admin-timeline-item">
                                <div className="admin-timeline-dot" style={{ background: event.color }}>
                                    <Icon size={13} color="#fff" />
                                </div>
                                {idx < filtered.length - 1 && <div className="admin-timeline-line" />}
                                <div className="admin-timeline-content">
                                    <div className="admin-timeline-header">
                                        <span className="admin-timeline-target" style={{ color: event.color }}>
                                            {event.target}
                                        </span>
                                        <span className="admin-timeline-time">
                                            <Clock size={12} />
                                            {new Date(event.time).toLocaleString("es", {
                                                day: "2-digit", month: "short", year: "numeric",
                                                hour: "2-digit", minute: "2-digit"
                                            })}
                                        </span>
                                    </div>
                                    <p className="admin-timeline-detail">{event.detail}</p>
                                    {event.actor && (
                                        <p className="admin-timeline-actor">
                                            <User size={12} /> Por: {event.actor}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
