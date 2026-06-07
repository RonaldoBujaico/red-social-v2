import { useEffect, useState } from "react";
import {
    Bell,
    Eye,
    EyeOff,
    Lock,
    LogOut,
    Moon,
    Save,
    Shield,
    Sun,
    User,
    Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { updateUserRequest } from "@/api/user.api";
import {
    getMySettingsRequest,
    updateMySettingsRequest,
} from "@/api/settings.api";
import { changePasswordRequest } from "@/api/auth.api";
import { useThemeStore } from "@/store/theme.store";
import PasswordInput from "@/components/PasswordInput";

type TabType =
    | "cuenta"
    | "privacidad"
    | "notificaciones"
    | "apariencia"
    | "seguridad";

type SettingsState = {
    privateAccount: boolean;
    showOnlineStatus: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    likeNotifications: boolean;
    commentNotifications: boolean;
    friendRequestNotifications: boolean;
    theme: "dark" | "light";
};



const defaultSettings: SettingsState = {
    privateAccount: false,
    showOnlineStatus: true,
    emailNotifications: true,
    pushNotifications: true,
    likeNotifications: true,
    commentNotifications: true,
    friendRequestNotifications: true,
    theme: "dark",
};

const tabs: { id: TabType; label: string }[] = [
    { id: "cuenta", label: "Cuenta" },
    { id: "privacidad", label: "Privacidad" },
    { id: "notificaciones", label: "Notificaciones" },
    { id: "apariencia", label: "Apariencia" },
    { id: "seguridad", label: "Seguridad" },
];

export default function Settings() {
    const { user, logout } = useAuthStore();
    const currentStoreTheme = useThemeStore((s) => s.theme);
    const setThemeStore = useThemeStore((s) => s.setTheme);

    const [activeTab, setActiveTab] = useState<TabType>("cuenta");
    const [savedMessage, setSavedMessage] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    const [settings, setSettings] = useState<SettingsState>(defaultSettings);
    const [loadingSettings, setLoadingSettings] = useState(true);

    const [profileForm, setProfileForm] = useState({
        firstName: user?.profile?.firstName || "",
        lastName: user?.profile?.lastName || "",
        username: user?.profile?.username || "",
        email: user?.email || "",
        bio: user?.profile?.bio || "",
        university: user?.profile?.university || "",
        faculty: user?.profile?.faculty || "",
        career: user?.profile?.career || "",
        cycle: user?.profile?.academic_cycle || user?.profile?.cycle || "",
        country: user?.profile?.country || "",
        department: user?.profile?.department || "",
        province: user?.profile?.province || "",
        district: user?.profile?.district || "",
        biography: user?.profile?.biography || "",
        interests: user?.interests?.map(i => i.interestName).join(", ") || "",
        skills: user?.skills?.map(s => s.skillName).join(", ") || "",
        courses: user?.courses?.map(c => c.courseName).join(", ") || "",
        researchTopics: user?.researchTopics?.map(t => t.topicName).join(", ") || "",
    });

    const [changingPassword, setChangingPassword] = useState(false);

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getMySettingsRequest();

                setSettings({
                    privateAccount: data.privateAccount,
                    showOnlineStatus: data.showOnlineStatus,
                    emailNotifications: data.emailNotifications,
                    pushNotifications: data.pushNotifications,
                    likeNotifications: data.likeNotifications,
                    commentNotifications: data.commentNotifications,
                    friendRequestNotifications: data.friendRequestNotifications,
                    theme: data.theme || "dark",
                });

                // Sync store with loaded database theme
                if (data.theme) {
                    setThemeStore(data.theme);
                }
            } catch (error) {
                console.error("Error cargando configuración", error);
            } finally {
                setLoadingSettings(false);
            }
        };

        fetchSettings();
    }, []);

    // Sync Settings component with ThemeStore state changes
    useEffect(() => {
        setSettings((prev) => ({ ...prev, theme: currentStoreTheme }));
    }, [currentStoreTheme]);

    const showSaved = (message = "Configuración guardada") => {
        setSavedMessage(message);

        setTimeout(() => {
            setSavedMessage("");
        }, 2500);
    };

    const updateSetting = async <K extends keyof SettingsState>(
        key: K,
        value: SettingsState[K],
    ) => {
        try {
            const newSettings = {
                ...settings,
                [key]: value,
            };

            setSettings(newSettings);

            // Sync global ThemeStore if changing the theme
            if (key === "theme") {
                setThemeStore(value as "dark" | "light");
            }

            const updatedSettings = await updateMySettingsRequest({
                [key]: value,
            });

            setSettings({
                privateAccount: updatedSettings.privateAccount,
                showOnlineStatus: updatedSettings.showOnlineStatus,
                emailNotifications: updatedSettings.emailNotifications,
                pushNotifications: updatedSettings.pushNotifications,
                likeNotifications: updatedSettings.likeNotifications,
                commentNotifications: updatedSettings.commentNotifications,
                friendRequestNotifications:
                    updatedSettings.friendRequestNotifications,
                theme: updatedSettings.theme || "dark",
            });

            showSaved("Configuración guardada en SQL Server");
        } catch (error) {
            console.error("Error guardando configuración", error);
            alert("No se pudo guardar la configuración");
        }
    };
    const handleSaveProfile = async () => {
        if (!user) return;

        if (!profileForm.firstName.trim()) {
            alert("El nombre no puede estar vacío");
            return;
        }

        if (!profileForm.lastName.trim()) {
            alert("El apellido no puede estar vacío");
            return;
        }

        if (!profileForm.username.trim()) {
            alert("El nombre de usuario no puede estar vacío");
            return;
        }

        if (!profileForm.email.trim()) {
            alert("El correo no puede estar vacío");
            return;
        }

        try {
            setSavingProfile(true);

            const updatedUser = await updateUserRequest(user.id, {
                firstName: profileForm.firstName.trim(),
                lastName: profileForm.lastName.trim(),
                username: profileForm.username.trim(),
                email: profileForm.email.trim(),
                bio: profileForm.bio.trim(),
                university: profileForm.university.trim(),
                faculty: profileForm.faculty.trim(),
                career: profileForm.career.trim(),
                cycle: profileForm.cycle.trim(),
                academic_cycle: profileForm.cycle.trim(),
                country: profileForm.country.trim(),
                department: profileForm.department.trim(),
                province: profileForm.province.trim(),
                district: profileForm.district.trim(),
                biography: profileForm.biography.trim(),
                interests: profileForm.interests.split(",").map(i => i.trim()).filter(Boolean),
                skills: profileForm.skills.split(",").map(s => s.trim()).filter(Boolean),
                courses: profileForm.courses.split(",").map(c => c.trim()).filter(Boolean),
                researchTopics: profileForm.researchTopics.split(",").map(t => t.trim()).filter(Boolean),
            });

            const storedAuth = localStorage.getItem("auth");

            if (storedAuth) {
                const authData = JSON.parse(storedAuth);

                const updatedAuth = {
                    ...authData,
                    user: updatedUser,
                };

                localStorage.setItem("auth", JSON.stringify(updatedAuth));
            }

            useAuthStore.setState({
                user: updatedUser,
            });

            showSaved("Perfil actualizado correctamente");
        } catch (error: any) {
            console.error("Error actualizando perfil", error);

            const message =
                error?.response?.data?.message ||
                error?.message ||
                "No se pudo actualizar el perfil";

            alert(message);
        } finally {
            setSavingProfile(false);
        }
    };

    const handleClearLocalSession = async () => {
        if (!confirm("¿Seguro que quieres limpiar la sesión local?")) return;

        localStorage.removeItem("auth");
        await logout();
    };

    const handleLogout = async () => {
        if (!confirm("¿Cerrar sesión en este dispositivo?")) return;

        await logout();
    };

    if (loadingSettings) {
        return (
            <div className="max-w-5xl mx-auto pb-12">
                <div className="bg-card border border-border rounded-3xl p-10 text-center text-muted-foreground">
                    Cargando configuración...
                </div>
            </div>
        );
    }
    const handleChangePassword = async () => {
        if (!passwordForm.currentPassword.trim()) {
            alert("Ingresa tu contraseña actual");
            return;
        }

        if (!passwordForm.newPassword.trim()) {
            alert("Ingresa tu nueva contraseña");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            alert("La nueva contraseña debe tener mínimo 6 caracteres");
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert("Las contraseñas nuevas no coinciden");
            return;
        }

        try {
            setChangingPassword(true);

            await changePasswordRequest({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });

            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            showSaved("Contraseña actualizada correctamente");
        } catch (error: any) {
            console.error("Error cambiando contraseña", error);

            const message =
                error?.response?.data?.message ||
                error?.message ||
                "No se pudo cambiar la contraseña";

            alert(message);
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Configuración</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Administra tu cuenta, privacidad, notificaciones y
                    apariencia.
                </p>
            </div>

            {savedMessage && (
                <div className="mb-5 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl px-4 py-3 text-sm font-semibold">
                    {savedMessage}
                </div>
            )}

            <div className="border-b border-border flex flex-wrap gap-2 mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 font-semibold transition border-b-2 ${activeTab === tab.id
                            ? "text-yellow-400 border-yellow-400"
                            : "text-muted-foreground border-transparent hover:text-foreground"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "cuenta" && (
                <div className="bg-card border border-border rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-11 h-11 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                            <User size={22} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">
                                Información de perfil
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Estos cambios se guardarán en SQL Server.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Nombres
                            </label>
                            <input
                                value={profileForm.firstName}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        firstName: e.target.value,
                                    }))
                                }
                                className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30"
                                placeholder="Nombres"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Apellidos
                            </label>
                            <input
                                value={profileForm.lastName}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        lastName: e.target.value,
                                    }))
                                }
                                className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30"
                                placeholder="Apellidos"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Nombre de usuario
                            </label>
                            <input
                                value={profileForm.username}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        username: e.target.value,
                                    }))
                                }
                                className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30"
                                placeholder="Nombre de usuario"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Correo
                            </label>
                            <input
                                value={profileForm.email}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        email: e.target.value,
                                    }))
                                }
                                className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30"
                                placeholder="Correo"
                            />
                        </div>

                        <div className="md:col-span-2 mt-4 pt-4 border-t border-border">
                            <h3 className="font-extrabold text-sm text-yellow-500 uppercase tracking-wider mb-3">
                                Información Académica
                            </h3>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Universidad
                            </label>
                            <input
                                value={profileForm.university}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        university: e.target.value,
                                    }))
                                }
                                className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30"
                                placeholder="Ej. UPN"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Facultad
                            </label>
                            <input
                                value={profileForm.faculty}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        faculty: e.target.value,
                                    }))
                                }
                                className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30"
                                placeholder="Ej. Ingeniería"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Carrera
                            </label>
                            <input
                                value={profileForm.career}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        career: e.target.value,
                                    }))
                                }
                                className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30"
                                placeholder="Ej. Ingeniería de Sistemas"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Ciclo Académico
                            </label>
                            <input
                                value={profileForm.cycle}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        cycle: e.target.value,
                                    }))
                                }
                                className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30"
                                placeholder="Ej. 5"
                            />
                        </div>

                        <div className="md:col-span-2 mt-4 pt-4 border-t border-border">
                            <h3 className="font-extrabold text-sm text-yellow-500 uppercase tracking-wider mb-3">
                                Ubicación Geográfica
                            </h3>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                País
                            </label>
                            <input
                                value={profileForm.country}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        country: e.target.value,
                                    }))
                                }
                                className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30"
                                placeholder="Ej. Perú"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Departamento
                            </label>
                            <input
                                value={profileForm.department}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        department: e.target.value,
                                    }))
                                }
                                className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30"
                                placeholder="Ej. Lima"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Provincia
                            </label>
                            <input
                                value={profileForm.province}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        province: e.target.value,
                                    }))
                                }
                                className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30"
                                placeholder="Ej. Lima"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Distrito
                            </label>
                            <input
                                value={profileForm.district}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        district: e.target.value,
                                    }))
                                }
                                className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30"
                                placeholder="Ej. Los Olivos"
                            />
                        </div>

                        <div className="md:col-span-2 mt-4 pt-4 border-t border-border">
                            <h3 className="font-extrabold text-sm text-yellow-500 uppercase tracking-wider mb-3">
                                Intereses, Habilidades y Especialidades (separados por comas)
                            </h3>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold mb-2">
                                Presentación Académica (Biografía Opcional)
                            </label>
                            <textarea
                                value={profileForm.biography}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        biography: e.target.value,
                                    }))
                                }
                                className="w-full min-h-24 bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30 resize-none"
                                placeholder="Escribe aquí tu presentación profesional o biografía formal"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Intereses Académicos
                            </label>
                            <input
                                value={profileForm.interests}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        interests: e.target.value,
                                    }))
                                }
                                className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30"
                                placeholder="Ej. Inteligencia Artificial, Robótica, Bases de Datos"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Habilidades Técnicas
                            </label>
                            <input
                                value={profileForm.skills}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        skills: e.target.value,
                                    }))
                                }
                                className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30"
                                placeholder="Ej. TypeScript, React, SQL Server, Python"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Cursos Favoritos
                            </label>
                            <input
                                value={profileForm.courses}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        courses: e.target.value,
                                    }))
                                }
                                className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30"
                                placeholder="Ej. Algoritmos, Estructuras de Datos, Ingeniería de Software"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Temas de Investigación
                            </label>
                            <input
                                value={profileForm.researchTopics}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        researchTopics: e.target.value,
                                    }))
                                }
                                className="w-full bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30"
                                placeholder="Ej. Deep Learning, NLP, Cloud Computing"
                            />
                        </div>

                        <div className="md:col-span-2 mt-4 pt-4 border-t border-border">
                            <label className="block text-sm font-semibold mb-2">
                                Descripción Corta del Perfil (Muro)
                            </label>
                            <textarea
                                value={profileForm.bio}
                                onChange={(e) =>
                                    setProfileForm((prev) => ({
                                        ...prev,
                                        bio: e.target.value,
                                    }))
                                }
                                className="w-full min-h-20 bg-background border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-500/30 resize-none"
                                placeholder="Eslogan corto que aparecerá en tu tarjeta de presentación"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSaveProfile}
                            disabled={savingProfile}
                            className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold px-5 py-3 rounded-2xl transition flex items-center gap-2"
                        >
                            {savingProfile ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            {savingProfile
                                ? "Guardando..."
                                : "Guardar cambios"}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === "privacidad" && (
                <div className="bg-card border border-border rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-11 h-11 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                            <Shield size={22} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">Privacidad</h2>
                            <p className="text-sm text-muted-foreground">
                                Controla cómo otros usuarios ven tu actividad.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <SettingSwitch
                            icon={<Lock size={20} />}
                            title="Cuenta privada"
                            description="Solo tus amistades podrán ver tus publicaciones."
                            checked={settings.privateAccount}
                            onChange={(value) =>
                                updateSetting("privateAccount", value)
                            }
                        />

                        <SettingSwitch
                            icon={
                                settings.showOnlineStatus ? (
                                    <Eye size={20} />
                                ) : (
                                    <EyeOff size={20} />
                                )
                            }
                            title="Mostrar estado en línea"
                            description="Permite que tus amistades vean si estás activo."
                            checked={settings.showOnlineStatus}
                            onChange={(value) =>
                                updateSetting("showOnlineStatus", value)
                            }
                        />
                    </div>

                    <div className="mt-6 bg-muted/40 rounded-2xl p-4 text-sm text-muted-foreground">
                        Preferencias guardadas localmente. Luego podemos crear
                        columnas en SQL Server para hacerlas persistentes por
                        usuario.
                    </div>
                </div>
            )}

            {activeTab === "notificaciones" && (
                <div className="bg-card border border-border rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-11 h-11 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                            <Bell size={22} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">
                                Notificaciones
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Decide qué actividad quieres recibir.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <SettingSwitch
                            icon={<Bell size={20} />}
                            title="Notificaciones por email"
                            description="Recibe avisos importantes en tu correo."
                            checked={settings.emailNotifications}
                            onChange={(value) =>
                                updateSetting("emailNotifications", value)
                            }
                        />

                        <SettingSwitch
                            icon={<Bell size={20} />}
                            title="Notificaciones push"
                            description="Activa avisos rápidos dentro de la aplicación."
                            checked={settings.pushNotifications}
                            onChange={(value) =>
                                updateSetting("pushNotifications", value)
                            }
                        />

                        <SettingSwitch
                            icon={<Bell size={20} />}
                            title="Likes en mis publicaciones"
                            description="Avisarme cuando alguien dé Me gusta a mis posts."
                            checked={settings.likeNotifications}
                            onChange={(value) =>
                                updateSetting("likeNotifications", value)
                            }
                        />

                        <SettingSwitch
                            icon={<Bell size={20} />}
                            title="Comentarios"
                            description="Avisarme cuando alguien comente mis publicaciones."
                            checked={settings.commentNotifications}
                            onChange={(value) =>
                                updateSetting("commentNotifications", value)
                            }
                        />

                        <SettingSwitch
                            icon={<Bell size={20} />}
                            title="Solicitudes de amistad"
                            description="Avisarme cuando alguien me envíe una solicitud."
                            checked={settings.friendRequestNotifications}
                            onChange={(value) =>
                                updateSetting(
                                    "friendRequestNotifications",
                                    value,
                                )
                            }
                        />
                    </div>
                </div>
            )}

            {activeTab === "apariencia" && (
                <div className="bg-card border border-border rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-11 h-11 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                            {settings.theme === "dark" ? (
                                <Moon size={22} />
                            ) : (
                                <Sun size={22} />
                            )}
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">Apariencia</h2>
                            <p className="text-sm text-muted-foreground">
                                Cambia el tema visual de UniConnect.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => updateSetting("theme", "dark")}
                            className={`border rounded-3xl p-5 text-left transition ${settings.theme === "dark"
                                ? "border-yellow-500 bg-yellow-500/10"
                                : "border-border hover:bg-muted"
                                }`}
                        >
                            <Moon className="text-yellow-400 mb-3" size={26} />
                            <h3 className="font-bold">Modo oscuro</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Ideal para trabajar de noche o con poca luz.
                            </p>
                        </button>

                        <button
                            onClick={() => updateSetting("theme", "light")}
                            className={`border rounded-3xl p-5 text-left transition ${settings.theme === "light"
                                ? "border-yellow-500 bg-yellow-500/10"
                                : "border-border hover:bg-muted"
                                }`}
                        >
                            <Sun className="text-yellow-400 mb-3" size={26} />
                            <h3 className="font-bold">Modo claro</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Una apariencia limpia para ambientes iluminados.
                            </p>
                        </button>
                    </div>
                </div>
            )}

            {activeTab === "seguridad" && (
                <div className="bg-card border border-border rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-11 h-11 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
                            <Shield size={22} />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">Seguridad</h2>
                            <p className="text-sm text-muted-foreground">
                                Cambia tu contraseña y administra tu sesión.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-background border border-border rounded-3xl p-5">
                            <Lock className="text-yellow-400 mb-3" size={26} />

                            <h3 className="font-bold text-lg">Cambiar contraseña</h3>

                            <p className="text-sm text-muted-foreground mt-1 mb-5">
                                Para proteger tu cuenta, primero valida tu contraseña actual.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Contraseña actual
                                    </label>

                                    <PasswordInput
                                        id="current-password"
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={(e) =>
                                            setPasswordForm((prev) => ({
                                                ...prev,
                                                currentPassword: e.target.value,
                                            }))
                                        }
                                        placeholder="Ingresa tu contraseña actual"
                                        ariaLabel="Contraseña actual"
                                        autoComplete="current-password"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Nueva contraseña
                                    </label>

                                    <PasswordInput
                                        id="new-password"
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={(e) =>
                                            setPasswordForm((prev) => ({
                                                ...prev,
                                                newPassword: e.target.value,
                                            }))
                                        }
                                        placeholder="Mínimo 6 caracteres"
                                        ariaLabel="Nueva contraseña"
                                        autoComplete="new-password"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Confirmar nueva contraseña
                                    </label>

                                    <PasswordInput
                                        id="confirm-password"
                                        name="confirmPassword"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) =>
                                            setPasswordForm((prev) => ({
                                                ...prev,
                                                confirmPassword: e.target.value,
                                            }))
                                        }
                                        placeholder="Repite tu nueva contraseña"
                                        ariaLabel="Confirmar nueva contraseña"
                                        autoComplete="new-password"
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleChangePassword}
                                disabled={changingPassword}
                                className="mt-5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold px-5 py-3 rounded-2xl transition flex items-center gap-2"
                            >
                                {changingPassword ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Lock size={18} />
                                )}

                                {changingPassword
                                    ? "Actualizando..."
                                    : "Actualizar contraseña"}
                            </button>
                        </div>

                        <div className="bg-background border border-border rounded-3xl p-5">
                            <LogOut className="text-red-400 mb-3" size={26} />

                            <h3 className="font-bold text-lg">Sesión actual</h3>

                            <p className="text-sm text-muted-foreground mt-1">
                                Cierra tu sesión en este dispositivo. Si cambiaste tu
                                contraseña, puedes volver a iniciar sesión con la nueva.
                            </p>

                            <div className="mt-5 space-y-3">
                                <button
                                    onClick={handleLogout}
                                    className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-3 rounded-2xl transition"
                                >
                                    Cerrar sesión
                                </button>

                                <button
                                    onClick={handleClearLocalSession}
                                    className="w-full bg-muted hover:bg-muted/80 font-semibold px-4 py-3 rounded-2xl transition"
                                >
                                    Limpiar sesión local
                                </button>
                            </div>

                            <div className="mt-5 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 text-sm text-yellow-800 dark:text-yellow-200">
                                Nota: cerrar todas las sesiones de todos los dispositivos
                                requiere guardar sesiones o versionar tokens en el backend.
                                Lo podemos agregar después si quieres seguridad más avanzada.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function SettingSwitch({
    icon,
    title,
    description,
    checked,
    onChange,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="bg-background border border-border rounded-3xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-muted text-yellow-400 flex items-center justify-center">
                    {icon}
                </div>

                <div>
                    <h3 className="font-bold">{title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {description}
                    </p>
                </div>
            </div>

            <button
                onClick={() => onChange(!checked)}
                className={`relative w-14 h-8 rounded-full transition ${checked ? "bg-yellow-500" : "bg-muted"
                    }`}
            >
                <span
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white transition ${checked ? "left-7" : "left-1"
                        }`}
                />
            </button>
        </div>
    );
}