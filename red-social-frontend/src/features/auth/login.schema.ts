// src/features/auth/login.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email("Correo inválido")
    .endsWith("@upn.pe", "Debe ser correo institucional"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type LoginForm = z.infer<typeof loginSchema>;