import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const login = useAuthStore((state) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            await login(email, password);

            console.log("Login exitoso");

            window.location.href = "/home";
        } catch (err: any) {
            console.error("Error login:", err);
            alert(err.message || "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl transition-all">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">
                        Bienvenido a UniConnect
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Inicia sesión para continuar
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-muted-foreground w-5 h-5" />
                        <input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-muted-foreground w-5 h-5" />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary transition"
                        />
                    </div>

                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" />
                            Recuérdame
                        </label>

                        <a
                            href="/forgot-password"
                            className="text-primary hover:underline"
                        >
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>

                    <div className="flex items-center my-6">
                        <div className="flex-1 h-px bg-border"></div>

                        <div className="flex-1 h-px bg-border"></div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-black font-semibold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
                    >
                        {loading ? "Cargando..." : "Iniciar sesión"}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-muted-foreground">
                    ¿No tienes cuenta?{" "}
                    <a
                        href="/register"
                        className="text-primary hover:underline"
                    >
                        Regístrate
                    </a>
                </p>
            </div>
        </div>
    );
}
