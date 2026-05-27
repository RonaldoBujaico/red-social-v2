import { api } from "@/api/axios";
import { CheckCircle, XCircle, Mail } from "lucide-react";
import { useState } from "react";

const Verify = () => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const code = params.get("code");

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const messages: Record<string, string> = {
        AUTH_TOKEN_EXPIRED: "El enlace ha expirado",
        VALIDATION_ERROR: "Token inválido",
        AUTH_EMAIL_NOT_VERIFIED: "La cuenta ya estaba verificada",
        UNKNOWN: "Ocurrió un error inesperado",
    };

    const isSuccess = status === "success";
    const isExpired = code === "AUTH_TOKEN_EXPIRED";

    const message = isSuccess
        ? "Cuenta verificada correctamente"
        : messages[code || "UNKNOWN"];

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            await api.post("/auth/resend-verification", {
                email,
            });

            setSent(true);
        } catch (err: any) {
            alert(err.response?.data?.message || "Error al enviar correo");
        } finally {
            setLoading(false);
        }
    };
    const showSuccessResend = sent;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
            <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-8 shadow-xl text-center">
                <div className="mb-4 flex justify-center">
                    {isSuccess || showSuccessResend ? (
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    ) : (
                        <XCircle className="w-16 h-16 text-red-500" />
                    )}
                </div>

                <h1 className="text-2xl font-bold mb-2">
                    {isSuccess
                        ? "Verificación exitosa"
                        : showSuccessResend
                          ? "Correo enviado"
                          : "Error de verificación"}
                </h1>

                <p className="text-muted-foreground mb-6">
                    {isSuccess
                        ? "Cuenta verificada correctamente"
                        : showSuccessResend
                          ? "Te enviamos un nuevo enlace de verificación. Revisa tu bandeja 📩"
                          : message}
                </p>

                {isExpired && !sent && (
                    <form onSubmit={handleResend} className="space-y-4 mb-4">
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-muted-foreground w-5 h-5" />
                            <input
                                type="email"
                                placeholder="Ingresa tu correo"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-black py-3 rounded-xl font-semibold hover:opacity-90 transition"
                        >
                            {loading ? "Enviando..." : "Reenviar verificación"}
                        </button>
                    </form>
                )}

                <a
                    href="/login"
                    className="inline-block bg-primary text-black px-6 py-2 rounded-xl font-semibold hover:opacity-90 transition"
                >
                    Ir al login
                </a>
            </div>
        </div>
    );
};

export default Verify;
