import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

interface PasswordInputProps {
    id?: string;
    name?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
    autoComplete?: string;
    required?: boolean;
    disabled?: boolean;
    /** Aria label for the toggle button (for screen readers) */
    ariaLabel?: string;
}

/**
 * PasswordInput
 * Componente reutilizable de contraseña con toggle mostrar/ocultar.
 * Usa lucide-react: Lock (izquierda), Eye / EyeOff (derecha).
 * Compatible con Tailwind CSS y completamente accesible.
 */
export default function PasswordInput({
    id,
    name,
    value,
    onChange,
    placeholder = "Contraseña",
    className = "",
    autoComplete = "current-password",
    required = false,
    disabled = false,
    ariaLabel = "Contraseña",
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    const baseClass =
        "w-full pl-10 pr-11 py-3 rounded-xl bg-background border border-border " +
        "focus:outline-none focus:ring-2 focus:ring-primary transition text-foreground " +
        "placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div className={`relative ${className}`}>
            {/* Icono izquierdo: candado */}
            <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                size={18}
                aria-hidden="true"
            />

            <input
                id={id}
                name={name}
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                autoComplete={autoComplete}
                required={required}
                disabled={disabled}
                aria-label={ariaLabel}
                className={baseClass}
            />

            {/* Botón toggle derecho: Eye / EyeOff */}
            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={disabled}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
                className={
                    "absolute right-3 top-1/2 -translate-y-1/2 " +
                    "text-muted-foreground hover:text-foreground transition-colors " +
                    "focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-0.5 " +
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                }
            >
                {showPassword ? (
                    <EyeOff size={18} aria-hidden="true" />
                ) : (
                    <Eye size={18} aria-hidden="true" />
                )}
            </button>
        </div>
    );
}
