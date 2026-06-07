import { useState } from "react";
import { Mail, User } from "lucide-react";
import { api } from "@/api/axios";
import PasswordInput from "@/components/PasswordInput";

export default function Register() {
    const [form, setForm] = useState({
        username: "",
        firstName: "",
        lastName: "",
        birthDate: "",
        gender: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);

            const res = await api.post("/auth/register", form);

            console.log("Registro exitoso:", res.data);

            alert("Cuenta creada. Revisa tu correo para verificarla.");

            window.location.href = "/login";
        } catch (err: any) {
            console.error("Error register:", err.response?.data?.message);
            alert(err.response?.data?.message || "Error al registrarse");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
            <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold">Crear cuenta</h1>
                    <p className="text-muted-foreground mt-2">
                        Regístrate para empezar
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 text-muted-foreground w-5 h-5" />
                        <input
                            name="username"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                            className="w-full pl-10 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>

                    <input
                        name="firstName"
                        placeholder="Nombre"
                        value={form.firstName}
                        onChange={handleChange}
                        className="w-full py-3 px-4 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none"
                    />

                    <input
                        name="lastName"
                        placeholder="Apellido"
                        value={form.lastName}
                        onChange={handleChange}
                        className="w-full py-3 px-4 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none"
                    />

                    <input
                        type="date"
                        name="birthDate"
                        value={form.birthDate}
                        onChange={handleChange}
                        className="w-full py-3 px-4 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none"
                    />

                    <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="w-full py-3 px-4 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none"
                    >
                        <option value="">Género</option>
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                    </select>

                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-muted-foreground w-5 h-5" />
                        <input
                            name="email"
                            type="email"
                            placeholder="Correo"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full pl-10 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>

                    <PasswordInput
                        id="register-password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Contraseña"
                        ariaLabel="Contraseña para la nueva cuenta"
                        autoComplete="new-password"
                    />

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-primary text-black font-semibold py-3 rounded-xl hover:opacity-90 transition"
                    >
                        {loading ? "Creando cuenta..." : "Registrarse"}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-muted-foreground">
                    ¿Ya tienes cuenta?{" "}
                    <a href="/login" className="text-primary hover:underline">
                        Inicia sesión
                    </a>
                </p>
            </div>
        </div>
    );
}
