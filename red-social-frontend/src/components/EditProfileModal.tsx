import React, { useState, useEffect } from "react";
import {
    X,
    User,
    Calendar,
    GraduationCap,
    Phone,
    Sparkles,
    Loader2,
    CheckCircle2,
    Mail,
    AtSign,
    BookOpen,
    ChevronDown,
} from "lucide-react";
import { updateUserRequest } from "@/api/user.api";
import { useAuthStore } from "@/store/auth.store";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
}

const cycles = [
    "1° Ciclo", "2° Ciclo", "3° Ciclo", "4° Ciclo", "5° Ciclo",
    "6° Ciclo", "7° Ciclo", "8° Ciclo", "9° Ciclo", "10° Ciclo", "Egresado",
];

interface FieldProps {
    label: string;
    icon: React.ReactNode;
    required?: boolean;
    children: React.ReactNode;
}

function Field({ label, icon, required, children }: FieldProps) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <span className="text-yellow-400/80">{icon}</span>
                {label}
                {required && <span className="text-red-400">*</span>}
            </label>
            {children}
        </div>
    );
}

const inputClass =
    "w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none " +
    "focus:ring-2 focus:ring-yellow-500/25 focus:border-yellow-500 transition placeholder:text-muted-foreground/50";

export default function EditProfileModal({
    isOpen,
    onClose,
    onSaveSuccess,
}: EditProfileModalProps) {
    const { user } = useAuthStore();
    const profile = user?.profile;

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        bio: "",
        gender: "other",
        birthDate: "",
        career: "",
        cycle: "",
        phone: "",
        hobbies: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Sync form when modal opens or user changes
    useEffect(() => {
        if (isOpen && user) {
            setForm({
                firstName: profile?.firstName || "",
                lastName: profile?.lastName || "",
                username: profile?.username || "",
                email: user.email || "",
                bio: profile?.bio || "",
                gender: profile?.gender || "other",
                birthDate: profile?.birthDate
                    ? new Date(profile.birthDate).toISOString().split("T")[0]
                    : "",
                career: profile?.career || "",
                cycle: profile?.cycle || "",
                phone: profile?.phone || "",
                hobbies: profile?.hobbies || "",
            });
            setError("");
            setSuccess(false);
        }
    }, [isOpen, user]);

    if (!isOpen || !user) return null;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError("");
        setSuccess(false);

        if (!form.firstName.trim() || !form.lastName.trim()) {
            setError("El nombre y apellido son obligatorios.");
            return;
        }
        if (!form.username.trim()) {
            setError("El nombre de usuario es obligatorio.");
            return;
        }
        if (!form.email.trim()) {
            setError("El correo es obligatorio.");
            return;
        }

        try {
            setLoading(true);
            const updatedUser = await updateUserRequest(user.id, {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                username: form.username.trim(),
                email: form.email.trim(),
                bio: form.bio.trim(),
                gender: form.gender as "male" | "female" | "other",
                birthDate: form.birthDate
                    ? new Date(form.birthDate).toISOString()
                    : undefined,
                career: form.career.trim(),
                cycle: form.cycle,
                phone: form.phone.trim(),
                hobbies: form.hobbies.trim(),
            });

            // Update auth store
            useAuthStore.setState({ user: updatedUser });

            // Persist in localStorage
            const storedAuth = localStorage.getItem("auth");
            if (storedAuth) {
                const authData = JSON.parse(storedAuth);
                localStorage.setItem(
                    "auth",
                    JSON.stringify({ ...authData, user: updatedUser }),
                );
            }

            setSuccess(true);
            setTimeout(() => {
                onSaveSuccess();
                onClose();
            }, 800);
        } catch (err: any) {
            console.error(err);
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "No se pudo actualizar el perfil",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 animate-fade-in"
            style={{ background: "rgba(0,0,0,0.65)" }}
        >
            <div
                className="bg-card border border-border w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-slide-up"
                style={{ maxHeight: "92vh" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-yellow-500/15 text-yellow-400 flex items-center justify-center">
                            <User size={18} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-foreground">
                                Editar Perfil
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Actualiza tu información personal
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-1.5 hover:bg-muted rounded-xl transition text-muted-foreground hover:text-foreground"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ── Feedback ── */}
                {error && (
                    <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-2xl text-sm font-medium flex-shrink-0">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mx-6 mt-4 p-3 bg-green-500/10 border border-green-500/25 text-green-400 rounded-2xl text-sm font-semibold flex items-center gap-2 flex-shrink-0">
                        <CheckCircle2 size={16} />
                        ¡Perfil actualizado exitosamente!
                    </div>
                )}

                {/* ── Form ── */}
                <form
                    onSubmit={handleSubmit}
                    className="overflow-y-auto flex-1 px-6 py-5 space-y-6"
                >
                    {/* — Datos personales — */}
                    <div>
                        <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-4">
                            Datos Personales
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Nombres" icon={<User size={12} />} required>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Ej: Carlos"
                                    required
                                />
                            </Field>
                            <Field label="Apellidos" icon={<User size={12} />} required>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Ej: García López"
                                    required
                                />
                            </Field>
                            <Field label="Usuario" icon={<AtSign size={12} />} required>
                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Ej: carlos_g"
                                    required
                                />
                            </Field>
                            <Field label="Correo" icon={<Mail size={12} />} required>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="ejemplo@upn.pe"
                                    required
                                />
                            </Field>
                            <Field label="Género" icon={<User size={12} />}>
                                <div className="relative">
                                    <select
                                        name="gender"
                                        value={form.gender}
                                        onChange={handleChange}
                                        className={inputClass + " appearance-none pr-8"}
                                    >
                                        <option value="male">Masculino</option>
                                        <option value="female">Femenino</option>
                                        <option value="other">Otro / Prefiero no decirlo</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-3 text-muted-foreground pointer-events-none" />
                                </div>
                            </Field>
                            <Field label="Fecha de Nacimiento" icon={<Calendar size={12} />}>
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={form.birthDate}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </Field>
                        </div>
                    </div>

                    {/* — Info académica — */}
                    <div>
                        <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-4">
                            Información Académica
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field label="Carrera" icon={<GraduationCap size={12} />}>
                                <input
                                    type="text"
                                    name="career"
                                    value={form.career}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Ej: Ingeniería de Sistemas"
                                />
                            </Field>
                            <Field label="Ciclo" icon={<BookOpen size={12} />}>
                                <div className="relative">
                                    <select
                                        name="cycle"
                                        value={form.cycle}
                                        onChange={handleChange}
                                        className={inputClass + " appearance-none pr-8"}
                                    >
                                        <option value="">Selecciona tu ciclo...</option>
                                        {cycles.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-3 text-muted-foreground pointer-events-none" />
                                </div>
                            </Field>
                            <Field label="Teléfono" icon={<Phone size={12} />}>
                                <input
                                    type="text"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="+51 987 654 321"
                                />
                            </Field>
                        </div>
                    </div>

                    {/* — Sobre mí — */}
                    <div>
                        <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-4">
                            Sobre Mí
                        </h4>
                        <div className="space-y-3">
                            <Field label="Biografía" icon={<User size={12} />}>
                                <textarea
                                    name="bio"
                                    value={form.bio}
                                    onChange={handleChange}
                                    className={inputClass + " min-h-[80px] resize-none"}
                                    placeholder="Cuéntale a la comunidad algo sobre ti..."
                                    maxLength={300}
                                />
                                <p className="text-xs text-muted-foreground text-right">
                                    {form.bio.length}/300
                                </p>
                            </Field>
                            <Field label="Hobbies e Intereses" icon={<Sparkles size={12} />}>
                                <textarea
                                    name="hobbies"
                                    value={form.hobbies}
                                    onChange={handleChange}
                                    className={inputClass + " min-h-[70px] resize-none"}
                                    placeholder="Programar, Leer, Fútbol, Música... (separados por comas)"
                                />
                            </Field>
                        </div>
                    </div>
                </form>

                {/* ── Footer ── */}
                <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-2 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-border hover:bg-muted text-foreground transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || success}
                        className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold px-6 py-2.5 text-sm rounded-xl transition flex items-center gap-2 shadow-md shadow-yellow-500/20"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Guardando...
                            </>
                        ) : success ? (
                            <>
                                <CheckCircle2 size={16} />
                                ¡Guardado!
                            </>
                        ) : (
                            "Guardar Cambios"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
