import { useEffect, useState, useMemo } from "react";
import { 
    getAdminReportsRequest, 
    resolveReportRequest, 
    toggleUserBanRequest, 
    adminDeletePostRequest, 
    adminDeleteCommentRequest,
    sendUserWarningRequest
} from "@/api/admin.api";
import { 
    Flag, Search, Filter, CheckCircle, XCircle, 
    Clock, ChevronDown, User, FileText, MessageSquare, AlertTriangle, ShieldOff
} from "lucide-react";

interface Report {
    id: number;
    reason: string;
    description?: string;
    status: "pending" | "resolved" | "dismissed";
    createdAt: string;
    resolvedAt?: string;
    reporter: { id: number; email: string; profile?: { firstName: string; lastName: string; username: string } };
    reportedUser?: { id: number; email: string; profile?: { firstName: string; lastName: string; username: string } } | null;
    reportedPost?: { id: number; content: string; user?: { id: number; profile?: { username: string } } } | null;
    reportedComment?: { id: number; content: string; user?: { id: number; profile?: { username: string } } } | null;
    resolvedBy?: { id: number; profile?: { firstName: string; lastName: string } } | null;
}

function ReportTypeBadge({ report }: { report: Report }) {
    if (report.reportedUser) return <span className="admin-badge admin-badge--blue"><User size={11} /> Usuario</span>;
    if (report.reportedPost) return <span className="admin-badge admin-badge--purple"><FileText size={11} /> Post</span>;
    if (report.reportedComment) return <span className="admin-badge admin-badge--violet"><MessageSquare size={11} /> Comentario</span>;
    return <span className="admin-badge admin-badge--gray">General</span>;
}

function StatusBadge({ status }: { status: string }) {
    if (status === "pending") return <span className="admin-badge admin-badge--orange"><Clock size={11} /> Pendiente</span>;
    if (status === "resolved") return <span className="admin-badge admin-badge--green"><CheckCircle size={11} /> Resuelto</span>;
    return <span className="admin-badge admin-badge--gray"><XCircle size={11} /> Descartado</span>;
}

export default function AdminReports() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");
    const [expanded, setExpanded] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const loadReports = async () => {
        setLoading(true);
        try {
            const data = await getAdminReportsRequest();
            setReports(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadReports(); }, []);

    const filtered = useMemo(() => {
        return reports.filter((r) => {
            const text = `${r.reason} ${r.description || ""} ${r.reporter?.profile?.username || ""}`.toLowerCase();
            const matchSearch = text.includes(search.toLowerCase());
            const matchStatus = filterStatus === "all" || r.status === filterStatus;
            const matchType =
                filterType === "all" ||
                (filterType === "user" && r.reportedUser) ||
                (filterType === "post" && r.reportedPost) ||
                (filterType === "comment" && r.reportedComment);
            return matchSearch && matchStatus && matchType;
        });
    }, [reports, search, filterStatus, filterType]);

    const handleResolve = async (id: number, status: "resolved" | "dismissed") => {
        setActionLoading(id);
        try {
            await resolveReportRequest(id, status);
            alert(`✅ Reporte #${id} marcado como ${status === "resolved" ? "resuelto" : "descartado"}.`);
            await loadReports();
            setExpanded(null);
        } catch (e: any) {
            alert(e?.message || "Error al resolver reporte");
        } finally {
            setActionLoading(null);
        }
    };

    const getReportedUserId = (report: Report) => {
        if (report.reportedUser) return report.reportedUser.id;
        if (report.reportedPost?.user) return report.reportedPost.user.id;
        if (report.reportedComment?.user) return report.reportedComment.user.id;
        return null;
    };

    const getReportedUserUsername = (report: Report) => {
        if (report.reportedUser) return report.reportedUser.profile?.username || report.reportedUser.email;
        if (report.reportedPost?.user) return report.reportedPost.user.profile?.username || "usuario";
        if (report.reportedComment?.user) return report.reportedComment.user.profile?.username || "usuario";
        return "usuario";
    };

    const handleSendWarning = async (report: Report) => {
        const userId = getReportedUserId(report);
        if (!userId) {
            alert("No se pudo identificar al usuario reportado.");
            return;
        }

        setActionLoading(report.id);
        try {
            await sendUserWarningRequest(userId, {
                reason: report.reason,
                postId: report.reportedPost?.id || null,
                commentId: report.reportedComment?.id || null,
            });
            const username = getReportedUserUsername(report);
            alert(`⚠️ Advertencia formal enviada al correo del usuario @${username} y registrada correctamente.`);
        } catch (e: any) {
            alert(e?.message || "Error al enviar la advertencia");
        } finally {
            setActionLoading(null);
        }
    };

    const handleActionToggleBan = async (userId: number, username: string) => {
        if (confirm(`¿Estás seguro de que deseas suspender temporalmente al usuario @${username}?`)) {
            try {
                await toggleUserBanRequest(userId, true);
                alert(`✅ El usuario @${username} ha sido suspendido.`);
                await loadReports();
            } catch (e: any) {
                alert(e?.message || "Error al suspender usuario");
            }
        }
    };

    const handleActionDeletePost = async (postId: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar permanentemente esta publicación por moderación?")) {
            try {
                await adminDeletePostRequest(postId);
                alert("✅ Publicación eliminada.");
                await loadReports();
            } catch (e: any) {
                alert(e?.message || "Error al eliminar publicación");
            }
        }
    };

    const handleActionDeleteComment = async (commentId: number) => {
        if (confirm("¿Estás seguro de que deseas eliminar permanentemente este comentario por moderación?")) {
            try {
                await adminDeleteCommentRequest(commentId);
                alert("✅ Comentario eliminado.");
                await loadReports();
            } catch (e: any) {
                alert(e?.message || "Error al eliminar comentario");
            }
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Gestión de Reportes</h1>
                    <p className="admin-page-subtitle">
                        {reports.filter(r => r.status === "pending").length} reportes pendientes de {reports.length} total
                    </p>
                </div>
            </div>

            <div className="admin-filter-bar">
                <div className="admin-search-box">
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por motivo o usuario..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="admin-filter-group">
                    <Filter size={15} />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Todos los estados</option>
                        <option value="pending">Pendientes</option>
                        <option value="resolved">Resueltos</option>
                        <option value="dismissed">Descartados</option>
                    </select>
                    <ChevronDown size={13} className="admin-select-arrow" />
                </div>
                <div className="admin-filter-group">
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="all">Todos los tipos</option>
                        <option value="user">Usuario</option>
                        <option value="post">Post</option>
                        <option value="comment">Comentario</option>
                    </select>
                    <ChevronDown size={13} className="admin-select-arrow" />
                </div>
                <span className="admin-results-count">{filtered.length} resultados</span>
            </div>

            {loading ? (
                <div className="admin-loading"><div className="admin-spinner" /><p>Cargando reportes...</p></div>
            ) : (
                <div className="admin-reports-list">
                    {filtered.length === 0 && (
                        <div className="admin-empty-state">
                            <Flag size={40} opacity={0.3} />
                            <p>No se encontraron reportes</p>
                        </div>
                    )}
                    {filtered.map((report) => (
                        <div key={report.id} className={`admin-report-card admin-report-card--${report.status}`}>
                            <div className="admin-report-header" onClick={() => setExpanded(expanded === report.id ? null : report.id)}>
                                <div className="admin-report-meta">
                                    <span className="admin-report-id">#{report.id}</span>
                                    <ReportTypeBadge report={report} />
                                    <StatusBadge status={report.status} />
                                </div>
                                <div className="admin-report-reason">
                                    <strong>{report.reason}</strong>
                                    {report.description && <span className="admin-report-desc"> — {report.description}</span>}
                                </div>
                                <div className="admin-report-info">
                                    <span>Por: @{report.reporter?.profile?.username || report.reporter?.email}</span>
                                    <span>{new Date(report.createdAt).toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                    <ChevronDown size={16} className={`admin-expand-arrow ${expanded === report.id ? "admin-expand-arrow--open" : ""}`} />
                                </div>
                            </div>

                            {expanded === report.id && (
                                <div className="admin-report-expanded">
                                    <div className="admin-report-details-grid">
                                        {/* Info del reporte */}
                                        <div className="admin-report-info-card">
                                            <h4 className="admin-report-section-title">Información del Reporte</h4>
                                            <div className="admin-report-info-text">
                                                <p><strong>Denunciante:</strong> @{report.reporter.profile?.username || report.reporter.email} ({report.reporter.email})</p>
                                                <p><strong>Fecha:</strong> {new Date(report.createdAt).toLocaleString("es")}</p>
                                                <p><strong>Motivo:</strong> {report.reason}</p>
                                                {report.description && <p><strong>Detalles:</strong> {report.description}</p>}
                                                {report.resolvedBy && (
                                                    <p className="admin-report-resolved-by">
                                                        <strong>Resuelto por:</strong> {report.resolvedBy.profile?.firstName} {report.resolvedBy.profile?.lastName} 
                                                        {report.resolvedAt && ` el ${new Date(report.resolvedAt).toLocaleDateString("es")}`}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Contenido denunciado */}
                                        <div className="admin-report-target-card">
                                            <h4 className="admin-report-section-title">Contenido Denunciado</h4>
                                            {report.reportedUser && (
                                                <div className="admin-report-entity">
                                                    <div className="admin-entity-header">
                                                        <User size={16} style={{ color: "#818cf8" }} />
                                                        <strong>Usuario Reportado:</strong> @{report.reportedUser.profile?.username || report.reportedUser.email}
                                                    </div>
                                                    <p className="admin-entity-sub">
                                                        Nombre: {report.reportedUser.profile?.firstName} {report.reportedUser.profile?.lastName}
                                                    </p>
                                                </div>
                                            )}

                                            {report.reportedPost && (
                                                <div className="admin-report-entity">
                                                    <div className="admin-entity-header">
                                                        <FileText size={16} style={{ color: "#a78bfa" }} />
                                                        <strong>Publicación de @{report.reportedPost.user?.profile?.username || "usuario"}:</strong>
                                                    </div>
                                                    <blockquote className="admin-entity-quote">
                                                        "{report.reportedPost.content}"
                                                    </blockquote>
                                                </div>
                                            )}

                                            {report.reportedComment && (
                                                <div className="admin-report-entity">
                                                    <div className="admin-entity-header">
                                                        <MessageSquare size={16} style={{ color: "#c4b5fd" }} />
                                                        <strong>Comentario de @{report.reportedComment.user?.profile?.username || "usuario"}:</strong>
                                                    </div>
                                                    <blockquote className="admin-entity-quote">
                                                        "{report.reportedComment.content}"
                                                    </blockquote>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Panel de Acciones de Moderación */}
                                    <div className="admin-report-actions-dashboard">
                                        {report.status === "pending" && (
                                            <div className="admin-resolution-actions">
                                                <span className="admin-action-section-title">Resolución del reporte:</span>
                                                <div className="admin-action-btn-row">
                                                    <button
                                                        className="admin-btn admin-btn--success admin-btn--sm"
                                                        disabled={actionLoading === report.id}
                                                        onClick={() => handleResolve(report.id, "resolved")}
                                                    >
                                                        <CheckCircle size={14} />
                                                        Marcar Resuelto
                                                    </button>
                                                    <button
                                                        className="admin-btn admin-btn--ghost admin-btn--sm"
                                                        disabled={actionLoading === report.id}
                                                        onClick={() => handleResolve(report.id, "dismissed")}
                                                    >
                                                        <XCircle size={14} />
                                                        Descartar
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="admin-moderation-actions">
                                            <span className="admin-action-section-title">Acciones directas de moderación:</span>
                                            <div className="admin-action-btn-row">
                                                <button
                                                    className="admin-btn admin-btn--sm admin-btn--primary"
                                                    disabled={actionLoading === report.id}
                                                    onClick={() => handleSendWarning(report)}
                                                >
                                                    <AlertTriangle size={14} /> Enviar Advertencia
                                                </button>

                                                {getReportedUserId(report) && (
                                                    <button
                                                        className="admin-btn admin-btn--sm admin-btn--danger"
                                                        onClick={() => handleActionToggleBan(getReportedUserId(report)!, getReportedUserUsername(report))}
                                                    >
                                                        <ShieldOff size={14} /> Suspender Usuario
                                                    </button>
                                                )}

                                                {report.reportedPost && (
                                                    <button
                                                        className="admin-btn admin-btn--sm admin-btn--danger"
                                                        onClick={() => handleActionDeletePost(report.reportedPost!.id)}
                                                    >
                                                        <XCircle size={14} /> Eliminar Publicación
                                                    </button>
                                                )}

                                                {report.reportedComment && (
                                                    <button
                                                        className="admin-btn admin-btn--sm admin-btn--danger"
                                                        onClick={() => handleActionDeleteComment(report.reportedComment!.id)}
                                                    >
                                                        <XCircle size={14} /> Eliminar Comentario
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
