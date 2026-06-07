import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import { api } from "@/api/axios";
import PasswordInput from "@/components/PasswordInput";

type Step = "email" | "reset" | "done";

export default function ForgotPassword() {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /* ── Paso 1: solicitar enlace de recuperación ── */
    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            setError("Ingresa tu correo electrónico.");
            return;
        }

        try {
            setLoading(true);
            await api.post("/auth/forgot-password", { email: email.trim() });
            setStep("reset");
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                "No se pudo enviar el correo. Verifica que el email sea correcto."
            );
        } finally {
            setLoading(false);
        }
    };

    /* ── Paso 2: ingresar token + nueva contraseña ── */
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!token.trim()) {
            setError("Ingresa el código de recuperación enviado a tu correo.");
            return;
        }

        if (newPassword.length < 6) {
            setError("La nueva contraseña debe tener mínimo 6 caracteres.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        try {
            setLoading(true);
            await api.post("/auth/reset-password", {
                token: token.trim(),
                newPassword,
            });
            setStep("done");
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                "El código es inválido o ha expirado. Solicita uno nuevo."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl transition-all">

                {/* ── Cabecera ── */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center mx-auto mb-4">
                        <KeyRound size={28} />
                    </div>

                    <h1 className="text-2xl font-bold">
                        {step === "email"
                            ? "¿Olvidaste tu contraseña?"
                            : step === "reset"
                            ? "Restablecer contraseña"
                            : "¡Contraseña actualizada!"}
                    </h1>

                    <p className="text-muted-foreground mt-2 text-sm">
                        {step === "email"
                            ? "Ingresa tu correo y te enviaremos un código de recuperación."
                            : step === "reset"
                            ? "Revisa tu correo e ingresa el código junto a tu nueva contraseña."
                            : "Ya puedes iniciar sesión con tu nueva contraseña."}
                    </p>
                </div>

                {/* ── Mensaje de error ── */}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* ── Paso 1: Email ── */}
                {step === "email" && (
                    <form onSubmit={handleRequestReset} className="space-y-4">
                        <div className="relative">
                            <Mail
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                size={18}
                                aria-hidden="true"
                            />
                            <input
                                id="forgot-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Correo electrónico institucional"
                                aria-label="Correo electrónico para recuperación"
                                autoComplete="email"
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary transition placeholder:text-muted-foreground"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-black font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                        >
                            {loading ? "Enviando..." : "Enviar código de recuperación"}
                        </button>
                    </form>
                )}

                {/* ── Paso 2: Token + Nueva contraseña ── */}
                {step === "reset" && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label
                                htmlFor="reset-token"
                                className="block text-sm font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide"
                            >
                                Código de recuperación
                            </label>
                            <input
                                id="reset-token"
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Pega aquí el código de tu correo"
                                aria-label="Código de recuperación recibido por correo"
                                autoComplete="one-time-code"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary transition placeholder:text-muted-foreground"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="new-password-forgot"
                                className="block text-sm font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide"
                            >
                                Nueva contraseña
                            </label>
                            <PasswordInput
                                id="new-password-forgot"
                                name="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                ariaLabel="Nueva contraseña"
                                autoComplete="new-password"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="confirm-password-forgot"
                                className="block text-sm font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide"
                            >
                                Confirmar contraseña
                            </label>
                            <PasswordInput
                                id="confirm-password-forgot"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repite tu nueva contraseña"
                                ariaLabel="Confirmar nueva contraseña"
                                autoComplete="new-password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-black font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                        >
                            {loading ? "Actualizando..." : "Restablecer contraseña"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setStep("email")}
                            className="w-full text-sm text-muted-foreground hover:text-foreground transition mt-1"
                        >
                            ← Solicitar un nuevo código
                        </button>
                    </form>
                )}

                {/* ── Paso 3: Éxito ── */}
                {step === "done" && (
                    <div className="text-center space-y-5">
                        <CheckCircle2
                            className="mx-auto text-green-400"
                            size={56}
                        />
                        <p className="text-sm text-muted-foreground">
                            Tu contraseña ha sido actualizada exitosamente.
                            Ahora puedes iniciar sesión con tus nuevas credenciales.
                        </p>
                        <a
                            href="/login"
                            className="block w-full bg-primary text-black font-semibold py-3 rounded-xl text-center hover:opacity-90 transition"
                        >
                            Ir al inicio de sesión
                        </a>
                    </div>
                )}

                {/* ── Volver al login ── */}
                {step !== "done" && (
                    <a
                        href="/login"
                        className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
                    >
                        <ArrowLeft size={15} />
                        Volver al inicio de sesión
                    </a>
                )}
            </div>
        </div>
    );
}
