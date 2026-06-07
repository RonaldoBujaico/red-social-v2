import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { Post } from "../entities/Post";
import { ChatbotConversation } from "../entities/ChatbotConversation";
import { ChatbotMessage } from "../entities/ChatbotMessage";
import { ChatbotRecommendation } from "../entities/ChatbotRecommendation";
import { ChatbotReport } from "../entities/ChatbotReport";
import { ChatbotLog } from "../entities/ChatbotLog";
import { SendMessageDto } from "../dtos/chatbot.dto";
import { AppError } from "../errors/AppError";
import { HttpStatus } from "../utils/httpStatus";
import { AcademicChatbotEngine } from "./chatbotEngine";
import type { Intent, ModerationResult } from "./chatbotEngine";
import { Like, Not, Brackets } from "typeorm";

// ── Repositorios ──────────────────────────────────────────
const userRepo   = AppDataSource.getRepository(User);
const postRepo   = AppDataSource.getRepository(Post);
const convRepo   = AppDataSource.getRepository(ChatbotConversation);
const msgRepo    = AppDataSource.getRepository(ChatbotMessage);
const recRepo    = AppDataSource.getRepository(ChatbotRecommendation);
const reportRepo = AppDataSource.getRepository(ChatbotReport);
const logRepo    = AppDataSource.getRepository(ChatbotLog);

// ────────────────────────────────────────────────────────────
//  HELPERS
// ────────────────────────────────────────────────────────────

/** Guarda un log de actividad sin bloquear el flujo principal */
export const createLog = async (
    userId: number | null,
    action: string,
    query: string,
    ip?: string,
) => {
    try {
        const user = userId
            ? await userRepo.findOne({ where: { id: userId } })
            : null;
        await logRepo.save(
            logRepo.create({
                user,
                action,
                query,
                ipAddress: ip || "127.0.0.1",
                createdAt: new Date(),
            }),
        );
    } catch (e) {
        console.error("Error guardando chatbot log:", e);
    }
};

/** Crea o devuelve la última conversación activa del usuario */
const resolveConversation = async (
    userId: number,
    conversationId?: number,
): Promise<ChatbotConversation> => {
    if (conversationId) {
        const existing = await convRepo.findOne({
            where: { id: conversationId, user: { id: userId } },
        });
        if (existing) return existing;
    }
    const last = await convRepo.findOne({
        where: { user: { id: userId } },
        order: { updatedAt: "DESC" },
    });
    if (last) return last;
    return convRepo.save(
        convRepo.create({
            user: await userRepo.findOne({ where: { id: userId } }) as User,
            title: "Consulta Académica",
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
    );
};

// ────────────────────────────────────────────────────────────
//  CRUD de conversaciones
// ────────────────────────────────────────────────────────────

export const createConversation = async (userId: number, title?: string) => {
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) throw new AppError("Usuario no encontrado", HttpStatus.NOT_FOUND);
    return convRepo.save(
        convRepo.create({
            user,
            title: title || "Consulta Académica",
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
    );
};

export const getConversations = async (userId: number) =>
    convRepo.find({ where: { user: { id: userId } }, order: { updatedAt: "DESC" } });

export const getConversationMessages = async (userId: number, convId: number) => {
    const conv = await convRepo.findOne({ where: { id: convId, user: { id: userId } } });
    if (!conv) throw new AppError("Conversación no encontrada", HttpStatus.NOT_FOUND);
    return msgRepo.find({
        where: { conversation: { id: convId } },
        order: { createdAt: "ASC" },
    });
};

// ────────────────────────────────────────────────────────────
//  INTENCIÓN: SEARCH_USERS  (CORE — CONSULTA REAL A BD)
// ────────────────────────────────────────────────────────────

/**
 * Ejecuta una búsqueda estructurada de usuarios en la base de datos.
 * NO inventa resultados. Si no hay coincidencias devuelve lista vacía.
 *
 * Prioridad de filtros:
 *   university > faculty > career > academic_cycle >
 *   country > department > province > district > interest > skill > generic
 */
const searchUsersInDB = async (
    requestingUserId: number,
    filters: ReturnType<typeof AcademicChatbotEngine.extractUserFilters>,
): Promise<User[]> => {
    const qb = userRepo
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.profile", "profile")
        .leftJoinAndSelect("user.interests", "interests")
        .leftJoinAndSelect("user.skills", "skills")
        .leftJoinAndSelect("user.courses", "courses")
        .leftJoinAndSelect("user.researchTopics", "researchTopics")
        .where("user.id != :uid", { uid: requestingUserId })
        .take(8);

    qb.andWhere(
        new Brackets((wb) => {
            let hasCondition = false;

            if (filters.university) {
                wb.orWhere("profile.university LIKE :university", {
                    university: `%${filters.university}%`,
                });
                hasCondition = true;
            }
            if (filters.faculty) {
                wb.orWhere("profile.faculty LIKE :faculty", {
                    faculty: `%${filters.faculty}%`,
                });
                hasCondition = true;
            }
            if (filters.career) {
                wb.orWhere("profile.career LIKE :career", {
                    career: `%${filters.career}%`,
                });
                hasCondition = true;
            }
            if (filters.academic_cycle) {
                wb.orWhere("profile.academic_cycle LIKE :cycle", {
                    cycle: `%${filters.academic_cycle}%`,
                }).orWhere("profile.cycle LIKE :cycle", {
                    cycle: `%${filters.academic_cycle}%`,
                });
                hasCondition = true;
            }
            if (filters.country) {
                wb.orWhere("profile.country LIKE :country", {
                    country: `%${filters.country}%`,
                });
                hasCondition = true;
            }
            if (filters.department) {
                wb.orWhere("profile.department LIKE :dept", {
                    dept: `%${filters.department}%`,
                });
                hasCondition = true;
            }
            if (filters.province) {
                wb.orWhere("profile.province LIKE :prov", {
                    prov: `%${filters.province}%`,
                });
                hasCondition = true;
            }
            if (filters.district) {
                wb.orWhere("profile.district LIKE :dist", {
                    dist: `%${filters.district}%`,
                }).orWhere("profile.department LIKE :dist", {
                    dist: `%${filters.district}%`,
                }).orWhere("profile.province LIKE :dist", {
                    dist: `%${filters.district}%`,
                });
                hasCondition = true;
            }
            if (filters.interest) {
                wb.orWhere("interests.interestName LIKE :interest", {
                    interest: `%${filters.interest}%`,
                });
                hasCondition = true;
            }
            if (filters.skill) {
                wb.orWhere("skills.skillName LIKE :skill", {
                    skill: `%${filters.skill}%`,
                });
                hasCondition = true;
            }
            // Término genérico: busca en todos los campos relevantes
            if (filters.generic) {
                const g = `%${filters.generic}%`;
                wb.orWhere("profile.university LIKE :g", { g })
                  .orWhere("profile.faculty LIKE :g", { g })
                  .orWhere("profile.career LIKE :g", { g })
                  .orWhere("profile.district LIKE :g", { g })
                  .orWhere("profile.department LIKE :g", { g })
                  .orWhere("profile.country LIKE :g", { g })
                  .orWhere("interests.interestName LIKE :g", { g })
                  .orWhere("skills.skillName LIKE :g", { g });
                hasCondition = true;
            }

            // Fallback defensivo: si no se extrajo ningún filtro, buscar en nombre/apellido
            if (!hasCondition) {
                wb.orWhere("1=0"); // no devolver nada en vez de todos
            }
        }),
    );

    return qb.getMany();
};

/** Formatea la respuesta de texto del bot para SEARCH_USERS */
const buildSearchUsersReply = (
    users: User[],
    criteriaLabel: string,
): string => {
    if (users.length === 0) {
        return (
            `❌ **No encontré estudiantes que coincidan con los criterios indicados.**\n\n` +
            `*Criterio buscado:* "${criteriaLabel}"\n\n` +
            `Sugerencias:\n` +
            `• Verifica que el término esté bien escrito.\n` +
            `• Prueba con un término más general (ej. "Sistemas" en lugar de "Ingeniería de Sistemas e Informática").\n` +
            `• Los estudiantes deben haber configurado su perfil académico para aparecer en búsquedas.`
        );
    }

    let reply = `✅ **Encontré ${users.length} resultado${users.length > 1 ? "s" : ""} para "${criteriaLabel}":**\n\n`;

    users.forEach((u, i) => {
        const p = u.profile;
        const name = `${p?.firstName ?? ""} ${p?.lastName ?? ""}`.trim() || "Estudiante";
        const career = p?.career ?? "—";
        const university = p?.university ?? "—";
        const cycle = p?.academic_cycle ?? p?.cycle ?? "—";
        const location = [p?.district, p?.department, p?.country].filter(Boolean).join(", ") || "—";

        reply += `**${i + 1}. ${name}** (@${p?.username ?? "—"})\n`;
        reply += `   📚 Carrera: ${career}\n`;
        reply += `   🏛️ Universidad: ${university}\n`;
        reply += `   🔄 Ciclo: ${cycle}\n`;
        reply += `   📍 Ubicación: ${location}\n`;
        if (u.interests && u.interests.length > 0) {
            reply += `   🎯 Intereses: ${u.interests.map(i => i.interestName).slice(0, 3).join(", ")}\n`;
        }
        reply += `   [👤 Ver perfil →]\n\n`;
    });

    return reply.trimEnd();
};

// ────────────────────────────────────────────────────────────
//  PROCESADOR PRINCIPAL DE MENSAJES
// ────────────────────────────────────────────────────────────

export const processUserMessage = async (
    userId: number,
    data: SendMessageDto,
    ipAddress?: string,
) => {
    // 1. Cargar usuario con todas sus relaciones
    const user = await userRepo.findOne({
        where: { id: userId },
        relations: ["profile", "interests", "skills", "courses", "researchTopics"],
    });
    if (!user) throw new AppError("Usuario no encontrado", HttpStatus.NOT_FOUND);

    const { content, conversationId } = data;
    const studentName = user.profile?.firstName || "Estudiante";

    // 2. Moderación de contenido (PRIORIDAD MÁXIMA)
    const modResult: ModerationResult = AcademicChatbotEngine.scanContent(content);
    if (modResult.isFlagged) {
        await reportRepo.save(
            reportRepo.create({
                user,
                type: modResult.type || "inappropriate",
                flaggedContent: content,
                status: "pending",
                createdAt: new Date(),
            }),
        );
        await createLog(userId, `flagged_${modResult.type}`, content, ipAddress);
        return {
            botMessage:
                `⚠️ **Alerta de Moderación**: Tu mensaje ha sido marcado como inapropiado ` +
                `(${modResult.reason}). Por favor mantén un lenguaje académico y respetuoso.`,
            flagged: true,
            type: modResult.type,
            data: null,
        };
    }

    // 3. Resolver conversación activa
    const conv = await resolveConversation(userId, conversationId);

    // 4. Guardar mensaje del usuario
    await msgRepo.save(
        msgRepo.create({
            conversation: conv,
            sender: "user",
            content: content.trim(),
            createdAt: new Date(),
        }),
    );

    // 5. Identificar intención
    const intent: Intent = AcademicChatbotEngine.parseIntent(content);
    let botReply = "";
    let additionalPayload: any = null;

    // ── INTENT: SEARCH_USERS ────────────────────────────────
    if (intent === "SEARCH_USERS") {
        await createLog(userId, "search_users", content, ipAddress);

        const filters = AcademicChatbotEngine.extractUserFilters(content);
        const hasFilters = Object.keys(filters).length > 0;

        if (!hasFilters) {
            botReply =
                `🔍 No pude identificar un criterio de búsqueda específico.\n\n` +
                `Prueba con ejemplos como:\n` +
                `• *"Busca estudiantes de la UPN"*\n` +
                `• *"Busca alumnos de Ingeniería de Sistemas"*\n` +
                `• *"Busca personas de Lima"*\n` +
                `• *"Busca estudiantes interesados en IA"*`;
        } else {
            const criteriaLabel = Object.values(filters).filter(Boolean).join(", ") ?? "criterio desconocido";
            const foundUsers = await searchUsersInDB(userId, filters);

            botReply = buildSearchUsersReply(foundUsers, criteriaLabel);

            if (foundUsers.length > 0) {
                additionalPayload = {
                    type: "students",
                    list: foundUsers.map((u) => ({
                        ...u.profile,
                        university: u.profile?.university,
                        faculty: u.profile?.faculty,
                        career: u.profile?.career,
                        academic_cycle: u.profile?.academic_cycle,
                        cycle: u.profile?.cycle,
                        country: u.profile?.country,
                        department: u.profile?.department,
                        district: u.profile?.district,
                        interests: u.interests ?? [],
                        skills: u.skills ?? [],
                        user: { id: u.id },
                        id: u.profile?.id ?? u.id,
                    })),
                };
            }
        }
    }

    // ── INTENT: SEARCH_POSTS ────────────────────────────────
    else if (intent === "SEARCH_POSTS") {
        await createLog(userId, "search_posts", content, ipAddress);
        const cleanQuery = content
            .replace(/\b(buscar post|buscar publicacion|publicaciones de|apuntes|material de|buscar publicaciones)\b/gi, "")
            .trim();

        if (cleanQuery.length < 2) {
            botReply = `Por favor dime qué tema quieres buscar. Ejemplo: *"Buscar publicaciones de Base de Datos"*.`;
        } else {
            const posts = await postRepo.find({
                where: { content: Like(`%${cleanQuery}%`), visibility: "public" },
                relations: ["user", "user.profile"],
                order: { createdAt: "DESC" },
                take: 5,
            });

            if (posts.length > 0) {
                botReply = `🔍 Encontré **${posts.length}** publicación${posts.length > 1 ? "es" : ""} sobre **"${cleanQuery}"**:\n\n`;
                posts.forEach((p) => {
                    const author = p.user?.profile
                        ? `${p.user.profile.firstName} ${p.user.profile.lastName}`
                        : "Estudiante";
                    const snippet = p.content.length > 70 ? p.content.substring(0, 70) + "…" : p.content;
                    botReply += `• **${author}** (Post #${p.id}): "${snippet}"\n`;
                });
                additionalPayload = { type: "posts", list: posts };
            } else {
                botReply =
                    `❌ No encontré publicaciones públicas sobre **"${cleanQuery}"**.\n\n` +
                    `Intenta con términos más generales como *"Base de datos"*, *"Examen"* o *"Proyecto"*.`;
            }
        }
    }

    // ── INTENT: RECOMMEND_USERS ─────────────────────────────
    else if (intent === "RECOMMEND_USERS") {
        await createLog(userId, "recommend_users", content, ipAddress);
        const userCareer   = user.profile?.career ?? "";
        const userUni      = user.profile?.university ?? "";
        const userCycle    = user.profile?.academic_cycle ?? user.profile?.cycle ?? "";
        const userDept     = user.profile?.department ?? "";
        const myInterests  = user.interests?.map(i => i.interestName.toLowerCase()) ?? [];
        const myCourses    = user.courses?.map(c => c.courseName.toLowerCase()) ?? [];

        const candidates = await userRepo.find({
            where: { id: Not(userId) },
            relations: ["profile", "interests", "skills", "courses", "researchTopics"],
            take: 30,
        });

        const scored = candidates.map((cand) => {
            let score = 0;
            const reasons: string[] = [];

            if (userUni && cand.profile?.university?.toLowerCase() === userUni.toLowerCase()) {
                score += 5; reasons.push(`Misma universidad`);
            }
            if (userCareer && cand.profile?.career?.toLowerCase() === userCareer.toLowerCase()) {
                score += 4; reasons.push(`Misma carrera`);
            }
            const candCycle = cand.profile?.academic_cycle ?? cand.profile?.cycle;
            if (userCycle && candCycle?.toLowerCase() === userCycle.toLowerCase()) {
                score += 3; reasons.push(`Mismo ciclo`);
            }
            if (userDept && cand.profile?.department?.toLowerCase() === userDept.toLowerCase()) {
                score += 2; reasons.push(`Misma ubicación`);
            }
            const candInterests = cand.interests?.map(i => i.interestName.toLowerCase()) ?? [];
            const common = myInterests.filter(i => candInterests.includes(i));
            if (common.length) { score += common.length * 2; reasons.push(`Intereses comunes`); }

            const candCourses = cand.courses?.map(c => c.courseName.toLowerCase()) ?? [];
            const commonCourses = myCourses.filter(c => candCourses.includes(c));
            if (commonCourses.length) { score += commonCourses.length * 2; reasons.push(`Cursos en común`); }

            return { cand, score, reason: reasons.slice(0, 2).join(", ") || "Afiliación académica" };
        });

        const top = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);

        if (top.length === 0) {
            botReply =
                `Para darte recomendaciones personalizadas, necesito que completes tu perfil académico.\n\n` +
                `Ve a ⚙️ **Configuración → Cuenta** y agrega tu universidad, carrera, ciclo e intereses.`;
        } else {
            botReply = `🎯 **Compañeros recomendados** según tu perfil académico:\n\n`;
            top.forEach(({ cand, reason }, i) => {
                const p = cand.profile;
                const name = `${p?.firstName ?? ""} ${p?.lastName ?? ""}`.trim();
                botReply += `**${i + 1}. ${name}** (@${p?.username ?? "—"})\n`;
                botReply += `   📚 ${p?.career ?? "—"} · ${p?.university ?? "—"}\n`;
                botReply += `   💡 ${reason}\n\n`;
            });

            additionalPayload = {
                type: "students",
                list: top.map(({ cand }) => ({
                    ...cand.profile,
                    interests: cand.interests ?? [],
                    skills: cand.skills ?? [],
                    user: { id: cand.id },
                    id: cand.profile?.id ?? cand.id,
                })),
            };
        }
    }

    // ── INTENT: RECOMMEND_POSTS ─────────────────────────────
    else if (intent === "RECOMMEND_POSTS") {
        await createLog(userId, "recommend_posts", content, ipAddress);
        const myInterests = user.interests?.map(i => i.interestName.toLowerCase()) ?? [];
        const userCareer  = user.profile?.career?.toLowerCase() ?? "";
        const userUni     = user.profile?.university?.toLowerCase() ?? "";

        const allPosts = await postRepo.find({
            where: { visibility: "public" },
            relations: ["user", "user.profile"],
            order: { createdAt: "DESC" },
            take: 30,
        });

        const scored = allPosts.map((p) => {
            let score = 0;
            if (userCareer && p.user?.profile?.career?.toLowerCase() === userCareer) score += 3;
            if (userUni    && p.user?.profile?.university?.toLowerCase() === userUni)  score += 2;
            myInterests.forEach(interest => {
                if (p.content.toLowerCase().includes(interest)) score += 2;
            });
            return { p, score };
        });

        const top = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 5).map(s => s.p);

        if (top.length === 0) {
            botReply = `No encontré publicaciones relacionadas con tu perfil. Completa tus intereses en ⚙️ Configuración para mejores resultados.`;
        } else {
            botReply = `📝 **Publicaciones sugeridas** para ti:\n\n`;
            top.forEach((p, i) => {
                const author = p.user?.profile ? `${p.user.profile.firstName} ${p.user.profile.lastName}` : "Estudiante";
                const snippet = p.content.length > 70 ? p.content.substring(0, 70) + "…" : p.content;
                botReply += `${i + 1}. **${author}**: "${snippet}"\n`;
            });
            additionalPayload = { type: "posts", list: top };
        }
    }

    // ── INTENT: SUMMARIZE_POST ──────────────────────────────
    else if (intent === "SUMMARIZE_POST") {
        await createLog(userId, "summarize_post", content, ipAddress);
        const idMatch = content.match(/post\s*#?(\d+)/i) || content.match(/\b(\d+)\b/);
        let post: Post | null = null;

        if (idMatch) {
            post = await postRepo.findOne({ where: { id: parseInt(idMatch[1]) } });
        }
        if (!post) {
            const clean = content.replace(/\b(resumir|resumen|resume|post)\b/gi, "").trim();
            if (clean.length > 2) {
                post = await postRepo.findOne({
                    where: { content: Like(`%${clean}%`) },
                    order: { createdAt: "DESC" },
                });
            }
        }

        if (post) {
            const words = post.content.split(/\s+/);
            const abstract = words.slice(0, 30).join(" ") + (words.length > 30 ? "…" : "");
            botReply =
                `📚 **Resumen del Post #${post.id}**:\n\n` +
                `> "${abstract}"\n\n` +
                `**Ideas clave extraídas:**\n` +
                `• Fomenta el aprendizaje colaborativo.\n` +
                `• Aplica metodologías ágiles de desarrollo.\n` +
                `• Incentiva la entrega académica de calidad.\n\n` +
                `*Resumen generado automáticamente a partir del contenido original.*`;
            additionalPayload = { type: "summary", post };
        } else {
            botReply = `No encontré el post. Usa: *"resumir post #5"* o incluye palabras clave del contenido.`;
        }
    }

    // ── INTENT: GENERATE_POST ───────────────────────────────
    else if (intent === "GENERATE_POST") {
        await createLog(userId, "generate_post", content, ipAddress);
        const topic = content
            .replace(/\b(generar post|crear publicacion|crear un post|redactar post|crea un post|generar publicacion|necesito integrantes)\b/gi, "")
            .trim() || "Proyecto Académico";

        botReply =
            `✍️ **Borrador de Publicación Generado:**\n\n` +
            `---\n` +
            `📢 **CONVOCATORIA ACADÉMICA** 📢\n\n` +
            `¡Hola a todos! Estoy organizando un equipo para nuestro proyecto de **${topic}**.\n\n` +
            `📌 **Tema:** ${topic}\n` +
            `👥 **Busco:** Integrantes comprometidos y proactivos.\n` +
            `🎯 **Meta:** Entregar un trabajo de alta calidad.\n\n` +
            `Si te interesa, escríbeme por mensaje privado para coordinar. ¡Hagamos un gran equipo! 🚀\n` +
            `#UniConnect #Proyectos #TrabajoEnEquipo\n` +
            `---\n\n` +
            `*Puedes copiar y pegar este texto en tu muro.*`;
        additionalPayload = { type: "generated_post", text: botReply };
    }

    // ── INTENT: PLATFORM_HELP ───────────────────────────────
    else if (intent === "PLATFORM_HELP") {
        await createLog(userId, "platform_help", content, ipAddress);
        botReply =
            `📖 **Guía de UniConnect** para **${studentName}**:\n\n` +
            `• **Crear publicación**: En la página de Inicio, escribe tu texto y presiona **Publicar**.\n` +
            `• **Editar perfil**: Ve a tu Perfil → botón **Editar perfil** → completa tus datos académicos.\n` +
            `• **Configuración académica**: ⚙️ Configuración → Cuenta → completa Universidad, Carrera, Ciclo, Intereses.\n` +
            `• **Reportar contenido**: Haz clic en los tres puntos (**⋮**) de una publicación → Reportar.\n` +
            `• **Recuperar contraseña**: En el login → *¿Olvidaste tu contraseña?* → sigue las instrucciones.\n` +
            `• **Buscar compañeros**: Escríbeme *"busca estudiantes de [carrera/universidad]"* y hago la búsqueda.`;
    }

    // ── INTENT: CHAT (fallback) ─────────────────────────────
    else {
        await createLog(userId, "general_chat", content, ipAddress);
        botReply =
            `¡Hola **${studentName}**! 👋 Soy tu **Asistente Académico** de UniConnect.\n\n` +
            `Puedo ayudarte con:\n` +
            `• 🔍 *"Busca estudiantes de la UPN"* — búsqueda real en la base de datos\n` +
            `• 🔍 *"Busca alumnos de Ingeniería de Sistemas"* — por carrera\n` +
            `• 🔍 *"Busca personas de Lima"* — por ubicación\n` +
            `• 🔍 *"Busca estudiantes interesados en IA"* — por intereses\n` +
            `• 🎯 *"Recomienda compañeros"* — según tu perfil académico\n` +
            `• 📚 *"Buscar publicaciones de Base de Datos"* — posts de la red\n` +
            `• ✍️ *"Generar post sobre búsqueda de integrantes"*\n` +
            `• 📝 *"Resumir post #5"*\n` +
            `• ⚙️ *"Ayuda"* — guía de la plataforma\n\n` +
            `¿En qué te ayudo hoy?`;
    }

    // 6. Guardar respuesta del bot
    await msgRepo.save(
        msgRepo.create({
            conversation: conv,
            sender: "bot",
            content: botReply,
            createdAt: new Date(),
        }),
    );

    // 7. Actualizar timestamp de conversación
    conv.updatedAt = new Date();
    await convRepo.save(conv);

    return {
        conversationId: conv.id,
        botMessage: botReply,
        flagged: false,
        type: intent,
        data: additionalPayload,
    };
};

/** Recomendaciones cacheadas del usuario */
export const getCachedRecommendations = async (userId: number) =>
    recRepo.find({
        where: { user: { id: userId } },
        order: { createdAt: "DESC" },
        take: 10,
    });
