import { z } from "zod";

export const CreateConversationSchema = z.object({
    title: z.string().max(255).optional(),
});

export const SendMessageSchema = z.object({
    conversationId: z.number().optional(),
    content: z.string().min(1, { message: "El mensaje no puede estar vacío" }),
});

export const GeneratePostSchema = z.object({
    prompt: z.string().min(3, { message: "La idea debe tener al menos 3 caracteres" }),
});

export const SummarizePostSchema = z.object({
    postId: z.number(),
});

export type CreateConversationDto = z.infer<typeof CreateConversationSchema>;
export type SendMessageDto = z.infer<typeof SendMessageSchema>;
export type GeneratePostDto = z.infer<typeof GeneratePostSchema>;
export type SummarizePostDto = z.infer<typeof SummarizePostSchema>;
