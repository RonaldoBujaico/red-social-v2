import { useState, useEffect } from "react";
import { Settings, Shield, Bell, Globe, Database, Save, CheckCircle, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

interface ConfigSection {
    id: string;
    label: string;
    icon: any;
}

const adminSections: ConfigSection[] = [
    { id: "general", label: "General", icon: Settings },
    { id: "security", label: "Seguridad", icon: Shield },
    { id: "moderation", label: "Moderación", icon: AlertTriangle },
    { id: "notifications", label: "Notificaciones", icon: Bell },
    { id: "platform", label: "Plataforma", icon: Globe },
    { id: "data", label: "Datos", icon: Database },
];

const moderatorSections: ConfigSection[] = [
    { id: "moderation", label: "Configuración de Moderación", icon: Shield },
];

export default function AdminConfig() {
    const { user } = useAuthStore();
    const [activeSection, setActiveSection] = useState("general");
    const [saved, setSaved] = useState(false);

    // Dynamic sections based on role
    const sections = user?.role === "moderator" ? moderatorSections : adminSections;

    // Set default active section based on role
    useEffect(() => {
        if (user?.role === "moderator") {
            setActiveSection("moderation");
        } else {
            setActiveSection("general");
        }
    }, [user]);

    // Config state
    const [config, setConfig] = useState({
        siteName: "UniConnect",
        siteDescription: "Red social universitaria para estudiantes",
        maintenanceMode: false,
        registrationOpen: true,
        maxPostLength: 2000,
        allowImages: true,
        requireEmailVerification: true,
        sessionTimeout: 60,
        maxLoginAttempts: 5,
        emailNotifications: true,
        pushNotifications: false,
        notifyOnReport: true,
        notifyOnNewUser: true,
        defaultLanguage: "es",
        timezone: "America/Lima",
        contentModeration: "manual",
        allowPublicPosts: true,
        dataRetentionDays: 365,
        backupFrequency: "daily",
        
        // Moderation specific configurations
        autoHideReportsCount: 5,
        blockedWords: "insulto1, insulto2, spam, bot, estafa",
        autoWarnOnReport: true,
        notifyModeratorOnFlag: true,
    });

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const toggle = (key: keyof typeof config) =>
        setConfig((prev) => ({ ...prev, [key]: !prev[key as keyof typeof config] }));

    const update = (key: keyof typeof config, value: any) =>
        setConfig((prev) => ({ ...prev, [key]: value }));

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">
                        {user?.role === "admin" ? "Configuración del Sistema" : "Configuración de Moderación"}
                    </h1>
                    <p className="admin-page-subtitle">
                        {user?.role === "admin" 
                            ? "Gestiona las opciones globales y de moderación de la plataforma" 
                            : "Ajusta las políticas y reglas del filtro automático"}
                    </p>
                </div>
                <button className={`admin-btn ${saved ? "admin-btn--success" : "admin-btn--primary"}`} onClick={handleSave}>
                    {saved ? <><CheckCircle size={16} /> Guardado</> : <><Save size={16} /> Guardar cambios</>}
                </button>
            </div>

            <div className="admin-config-layout">
                {/* Sidebar tabs */}
                <div className="admin-config-tabs">
                    {sections.map((s) => (
                        <button
                            key={s.id}
                            className={`admin-config-tab ${activeSection === s.id ? "admin-config-tab--active" : ""}`}
                            onClick={() => setActiveSection(s.id)}
                        >
                            <s.icon size={17} />
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="admin-config-content">
                    {activeSection === "general" && user?.role === "admin" && (
                        <div className="admin-config-section">
                            <h2 className="admin-config-section-title">Configuración General</h2>
                            <div className="admin-form-group">
                                <label>Nombre de la plataforma</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={config.siteName}
                                    onChange={(e) => update("siteName", e.target.value)}
                                />
                            </div>
                            <div className="admin-form-group">
                                <label>Descripción</label>
                                <textarea
                                    className="admin-input admin-textarea"
                                    value={config.siteDescription}
                                    onChange={(e) => update("siteDescription", e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="admin-form-group">
                                <label>Longitud máxima de publicaciones</label>
                                <input
                                    type="number"
                                    className="admin-input"
                                    value={config.maxPostLength}
                                    onChange={(e) => update("maxPostLength", Number(e.target.value))}
                                />
                            </div>
                            <div className="admin-toggle-group">
                                <div className="admin-toggle-item">
                                    <div>
                                        <p className="admin-toggle-label">Modo mantenimiento</p>
                                        <p className="admin-toggle-hint">Bloquea el acceso de usuarios normales</p>
                                    </div>
                                    <button
                                        className={`admin-toggle-btn ${config.maintenanceMode ? "admin-toggle-btn--on" : ""}`}
                                        onClick={() => toggle("maintenanceMode")}
                                    >
                                        <span className="admin-toggle-thumb" />
                                    </button>
                                </div>
                                <div className="admin-toggle-item">
                                    <div>
                                        <p className="admin-toggle-label">Registro abierto</p>
                                        <p className="admin-toggle-hint">Permite que nuevos usuarios se registren</p>
                                    </div>
                                    <button
                                        className={`admin-toggle-btn ${config.registrationOpen ? "admin-toggle-btn--on" : ""}`}
                                        onClick={() => toggle("registrationOpen")}
                                    >
                                        <span className="admin-toggle-thumb" />
                                    </button>
                                </div>
                                <div className="admin-toggle-item">
                                    <div>
                                        <p className="admin-toggle-label">Permitir imágenes en posts</p>
                                        <p className="admin-toggle-hint">Los usuarios pueden subir imágenes</p>
                                    </div>
                                    <button
                                        className={`admin-toggle-btn ${config.allowImages ? "admin-toggle-btn--on" : ""}`}
                                        onClick={() => toggle("allowImages")}
                                    >
                                        <span className="admin-toggle-thumb" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "security" && user?.role === "admin" && (
                        <div className="admin-config-section">
                            <h2 className="admin-config-section-title">Seguridad</h2>
                            <div className="admin-form-group">
                                <label>Tiempo de sesión (minutos)</label>
                                <input
                                    type="number"
                                    className="admin-input"
                                    value={config.sessionTimeout}
                                    onChange={(e) => update("sessionTimeout", Number(e.target.value))}
                                />
                            </div>
                            <div className="admin-form-group">
                                <label>Máximo de intentos de login</label>
                                <input
                                    type="number"
                                    className="admin-input"
                                    value={config.maxLoginAttempts}
                                    onChange={(e) => update("maxLoginAttempts", Number(e.target.value))}
                                />
                            </div>
                            <div className="admin-toggle-group">
                                <div className="admin-toggle-item">
                                    <div>
                                        <p className="admin-toggle-label">Verificación de email obligatoria</p>
                                        <p className="admin-toggle-hint">Los usuarios deben verificar su email</p>
                                    </div>
                                    <button
                                        className={`admin-toggle-btn ${config.requireEmailVerification ? "admin-toggle-btn--on" : ""}`}
                                        onClick={() => toggle("requireEmailVerification")}
                                    >
                                        <span className="admin-toggle-thumb" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "moderation" && (
                        <div className="admin-config-section">
                            <h2 className="admin-config-section-title">Configuración de Moderación</h2>
                            <p className="admin-config-section-subtitle mb-4">
                                Define las políticas para el filtro de palabras, auto-bloqueo y advertencias del sistema.
                            </p>
                            <div className="admin-form-group">
                                <label>Umbral de Reportes para Ocultación Automática</label>
                                <input
                                    type="number"
                                    className="admin-input"
                                    value={config.autoHideReportsCount}
                                    onChange={(e) => update("autoHideReportsCount", Number(e.target.value))}
                                />
                                <span className="admin-input-hint">El contenido se ocultará automáticamente al alcanzar esta cantidad de reportes hasta que un moderador lo revise.</span>
                            </div>
                            <div className="admin-form-group">
                                <label>Filtro de Palabras Ofensivas (separadas por comas)</label>
                                <textarea
                                    className="admin-input admin-textarea"
                                    value={config.blockedWords}
                                    onChange={(e) => update("blockedWords", e.target.value)}
                                    rows={4}
                                    placeholder="insulto1, insulto2..."
                                />
                                <span className="admin-input-hint">Los posts o comentarios que contengan estas palabras clave serán marcados automáticamente para revisión urgente.</span>
                            </div>
                            <div className="admin-toggle-group">
                                <div className="admin-toggle-item">
                                    <div>
                                        <p className="admin-toggle-label">Auto-advertir al usuario</p>
                                        <p className="admin-toggle-hint">Enviar automáticamente un correo de advertencia cuando sus publicaciones sean reportadas</p>
                                    </div>
                                    <button
                                        className={`admin-toggle-btn ${config.autoWarnOnReport ? "admin-toggle-btn--on" : ""}`}
                                        onClick={() => toggle("autoWarnOnReport")}
                                    >
                                        <span className="admin-toggle-thumb" />
                                    </button>
                                </div>
                                <div className="admin-toggle-item">
                                    <div>
                                        <p className="admin-toggle-label">Notificar Moderadores por Reportes Críticos</p>
                                        <p className="admin-toggle-hint">Recibir avisos prioritarios cuando un elemento reciba reportes rápidos</p>
                                    </div>
                                    <button
                                        className={`admin-toggle-btn ${config.notifyModeratorOnFlag ? "admin-toggle-btn--on" : ""}`}
                                        onClick={() => toggle("notifyModeratorOnFlag")}
                                    >
                                        <span className="admin-toggle-thumb" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "notifications" && user?.role === "admin" && (
                        <div className="admin-config-section">
                            <h2 className="admin-config-section-title">Notificaciones</h2>
                            <div className="admin-toggle-group">
                                {[
                                    { key: "emailNotifications", label: "Notificaciones por email", hint: "Enviar emails a los usuarios" },
                                    { key: "pushNotifications", label: "Notificaciones push", hint: "Enviar notificaciones push en tiempo real" },
                                    { key: "notifyOnReport", label: "Alerta en nuevos reportes", hint: "Notificar a admins cuando hay un nuevo reporte" },
                                    { key: "notifyOnNewUser", label: "Alerta en nuevos usuarios", hint: "Notificar a admins cuando se registra un usuario" },
                                ].map(({ key, label, hint }) => (
                                    <div key={key} className="admin-toggle-item">
                                        <div>
                                            <p className="admin-toggle-label">{label}</p>
                                            <p className="admin-toggle-hint">{hint}</p>
                                        </div>
                                        <button
                                            className={`admin-toggle-btn ${config[key as keyof typeof config] ? "admin-toggle-btn--on" : ""}`}
                                            onClick={() => toggle(key as keyof typeof config)}
                                        >
                                            <span className="admin-toggle-thumb" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === "platform" && user?.role === "admin" && (
                        <div className="admin-config-section">
                            <h2 className="admin-config-section-title">Plataforma</h2>
                            <div className="admin-form-group">
                                <label>Idioma por defecto</label>
                                <select
                                    className="admin-input"
                                    value={config.defaultLanguage}
                                    onChange={(e) => update("defaultLanguage", e.target.value)}
                                >
                                    <option value="es">Español</option>
                                    <option value="en">English</option>
                                    <option value="pt">Português</option>
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label>Zona horaria</label>
                                <select
                                    className="admin-input"
                                    value={config.timezone}
                                    onChange={(e) => update("timezone", e.target.value)}
                                >
                                    <option value="America/Mexico_City">México (UTC-6)</option>
                                    <option value="America/Bogota">Colombia (UTC-5)</option>
                                    <option value="America/Lima">Perú (UTC-5)</option>
                                    <option value="America/Argentina/Buenos_Aires">Argentina (UTC-3)</option>
                                    <option value="Europe/Madrid">España (UTC+1)</option>
                                </select>
                            </div>
                            <div className="admin-form-group">
                                <label>Moderación de contenido</label>
                                <select
                                    className="admin-input"
                                    value={config.contentModeration}
                                    onChange={(e) => update("contentModeration", e.target.value)}
                                >
                                    <option value="manual">Manual (revisión por admin)</option>
                                    <option value="auto">Automática</option>
                                    <option value="off">Desactivada</option>
                                </select>
                            </div>
                            <div className="admin-toggle-group">
                                <div className="admin-toggle-item">
                                    <div>
                                        <p className="admin-toggle-label">Permitir posts públicos</p>
                                        <p className="admin-toggle-hint">Los usuarios pueden publicar contenido público</p>
                                    </div>
                                    <button
                                        className={`admin-toggle-btn ${config.allowPublicPosts ? "admin-toggle-btn--on" : ""}`}
                                        onClick={() => toggle("allowPublicPosts")}
                                    >
                                        <span className="admin-toggle-thumb" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === "data" && user?.role === "admin" && (
                        <div className="admin-config-section">
                            <h2 className="admin-config-section-title">Gestión de Datos</h2>
                            <div className="admin-form-group">
                                <label>Retención de datos (días)</label>
                                <input
                                    type="number"
                                    className="admin-input"
                                    value={config.dataRetentionDays}
                                    onChange={(e) => update("dataRetentionDays", Number(e.target.value))}
                                />
                                <span className="admin-input-hint">Los datos inactivos se eliminarán tras este período</span>
                            </div>
                            <div className="admin-form-group">
                                <label>Frecuencia de backups</label>
                                <select
                                    className="admin-input"
                                    value={config.backupFrequency}
                                    onChange={(e) => update("backupFrequency", e.target.value)}
                                >
                                    <option value="hourly">Cada hora</option>
                                    <option value="daily">Diario</option>
                                    <option value="weekly">Semanal</option>
                                    <option value="monthly">Mensual</option>
                                </select>
                            </div>
                            <div className="admin-info-box">
                                <Database size={16} />
                                <p>Los backups se almacenan de forma segura. Contacta a tu proveedor de hosting para gestionar backups manuales.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
