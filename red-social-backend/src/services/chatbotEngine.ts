// ============================================================
//  AcademicChatbotEngine — Motor NLP mejorado
//  Intenciones: SEARCH_USERS | SEARCH_POSTS | GENERATE_POST |
//               RECOMMEND_USERS | RECOMMEND_POSTS | PLATFORM_HELP |
//               SUMMARIZE_POST | MODERATE_CONTENT | CHAT
// ============================================================

export type Intent =
    | "SEARCH_USERS"
    | "SEARCH_POSTS"
    | "GENERATE_POST"
    | "RECOMMEND_USERS"
    | "RECOMMEND_POSTS"
    | "PLATFORM_HELP"
    | "SUMMARIZE_POST"
    | "MODERATE_CONTENT"
    | "CHAT";

export interface ModerationResult {
    isFlagged: boolean;
    type: "spam" | "offensive" | "harassment" | "inappropriate" | null;
    reason: string | null;
}

/** Campos de perfil por los cuales se puede filtrar una búsqueda de usuarios */
export interface UserSearchFilters {
    university?: string;
    faculty?: string;
    career?: string;
    academic_cycle?: string;
    country?: string;
    department?: string;
    province?: string;
    district?: string;
    interest?: string;
    skill?: string;
    /** Término genérico cuando no se pudo clasificar en un campo concreto */
    generic?: string;
}

// ────────────────────────────────────────────────────────────
//  Palabras clave que marcan la intención SEARCH_USERS
// ────────────────────────────────────────────────────────────
const SEARCH_USERS_TRIGGERS = [
    "busca estudiantes",
    "buscar estudiantes",
    "busca alumnos",
    "buscar alumnos",
    "busca compañeros",
    "buscar compañeros",
    "busca personas",
    "buscar personas",
    "muéstrame estudiantes",
    "muestrame estudiantes",
    "muéstrame alumnos",
    "muestrame alumnos",
    "encuentra estudiantes",
    "encuentra alumnos",
    "encuentra personas",
    "estudiantes de",
    "alumnos de",
    "compañeros de",
    "personas de",
    "personas interesadas en",
    "interesados en",
    "quien estudia",
    "quién estudia",
    "quienes estudian",
    "quiénes estudian",
    "quien esta en",
    "quién está en",
    "quienes estan en",
    "quiénes están en",
    "estudia en",
    "estudian en",
    "que estudian",
    "que estudia",
    "gente de",
    "gente interesada",
];

// ────────────────────────────────────────────────────────────
//  Palabras clave de campo geográfico / académico
// ────────────────────────────────────────────────────────────
const UNIVERSITY_KW = [
    "universidad", "upn", "uni", "usmp", "pucp", "upc", "unmsm",
    "utp", "udep", "unsaac", "unsa", "uncp", "unsa", "universidad nacional",
    "universidad privada",
];
const FACULTY_KW = ["facultad", "escuela de", "escuela profesional"];
const CAREER_KW = [
    "carrera", "ingeniería de sistemas", "sistemas", "contabilidad",
    "administración", "derecho", "medicina", "enfermería", "arquitectura",
    "civil", "mecatrónica", "industrial", "electrónica", "informática",
    "psicología", "marketing", "economía", "negocios", "educación",
    "ingeniería", "ciencias",
];
const CYCLE_KW = [
    "ciclo", "semestre", "primer ciclo", "segundo ciclo", "tercer ciclo",
    "cuarto ciclo", "quinto ciclo", "sexto ciclo", "séptimo ciclo",
    "octavo ciclo", "noveno ciclo", "décimo ciclo",
];
const DISTRICT_KW = [
    "lima", "huancayo", "arequipa", "cusco", "trujillo", "piura",
    "chiclayo", "iquitos", "tacna", "puno", "miraflores", "san isidro",
    "surco", "barranco", "callao", "ate", "los olivos", "villa el salvador",
    "villa maría", "comas", "independencia", "carabayllo", "san martín",
    "san juan", "chorrillos", "lince", "pueblo libre",
];
const INTEREST_KW = [
    "inteligencia artificial", "ia", "machine learning", "deep learning",
    "nlp", "programación", "desarrollo web", "backend", "frontend",
    "base de datos", "sql", "cloud", "devops", "redes", "seguridad",
    "blockchain", "robótica", "internet de las cosas", "iot",
    "ciencia de datos", "data science", "análisis de datos",
    "videojuegos", "game development", "ciberseguridad",
    "marketing digital", "diseño", "ux", "ui",
];

export class AcademicChatbotEngine {
    // ──────────────────────────────────────────────────────
    //  Moderación de contenido
    // ──────────────────────────────────────────────────────
    static scanContent(content: string): ModerationResult {
        const lower = content.toLowerCase();

        const spamRegex =
            /(gana dinero fácil|trabaja desde casa|bit\.ly\/|cutt\.ly\/|💸|🎰|🔞|compra cripto|gana bitcoin|hazte rico|bet365|casino)/gi;
        if (spamRegex.test(lower)) {
            return { isFlagged: true, type: "spam", reason: "Contenido de SPAM no académico" };
        }

        const slurs = [
            "imbecil","imbécil","estupido","estúpido","bobo","puta","puto","mierda",
            "basura","hijo de","maldito","gordo","gorda","feo","fea","cabron","cabrón",
            "cagon","cagón","estupida","estúpida","maricon","maricón","zorra","estafa",
            "idiota","estupidez","pendejo","pendeja","violador","acosador",
        ];
        for (const slur of slurs) {
            if (new RegExp(`\\b${slur}\\b`, "i").test(lower)) {
                return {
                    isFlagged: true,
                    type: "offensive",
                    reason: `Uso de la palabra ofensiva "${slur}"`,
                };
            }
        }

        return { isFlagged: false, type: null, reason: null };
    }

    // ──────────────────────────────────────────────────────
    //  Identificación de intención principal
    // ──────────────────────────────────────────────────────
    static parseIntent(content: string): Intent {
        const lower = content.toLowerCase().trim();

        // MODERATE_CONTENT tiene prioridad 0 (ya se evalúa antes de llegar aquí)

        // 1. SUMMARIZE_POST
        if (/\b(resumir|resumen|resume|extracto)\b/.test(lower)) return "SUMMARIZE_POST";

        // 2. GENERATE_POST
        if (
            /\b(generar post|crear publicacion|crear un post|redactar post|crea un post|generar publicacion|necesito integrantes)\b/.test(lower)
        ) return "GENERATE_POST";

        // 3. RECOMMEND_USERS (explícito) — compañeros / estudio / grupo
        if (
            /\b(recomendar compañeros|recomienda compañeros|sugerir compañeros|sugiere compañeros|grupos de estudio|recomiendame compañeros)\b/.test(lower)
        ) return "RECOMMEND_USERS";

        // 4. RECOMMEND_POSTS
        if (
            /\b(recomendar publicaciones?|recomienda publicaciones?|sugerir publicaciones?|recomendar posts?)\b/.test(lower)
        ) return "RECOMMEND_POSTS";

        // 5. RECOMMEND (genérico → usuarios)
        if (
            /\b(recomendar|recomienda|recomendaci[oó]n|sugerencias|sugerencia|recomi[eé]ndame)\b/.test(lower)
        ) return "RECOMMEND_USERS";

        // 6. PLATFORM_HELP
        if (
            /\b(ayuda|c[oó]mo crear|c[oó]mo editar|c[oó]mo reportar|c[oó]mo recuperar|funcionalidades|soporte|manual)\b/.test(lower)
        ) return "PLATFORM_HELP";

        // 7. SEARCH_USERS — es la intención más importante
        if (SEARCH_USERS_TRIGGERS.some((kw) => lower.includes(kw))) return "SEARCH_USERS";

        // 8. SEARCH_POSTS
        if (
            /\b(buscar post|buscar publicacion|publicaciones de|apuntes|material de|buscar de|buscar publicaciones)\b/.test(lower)
        ) return "SEARCH_POSTS";

        return "CHAT";
    }

    // ──────────────────────────────────────────────────────
    //  Extracción de filtros para SEARCH_USERS
    //  Devuelve los filtros más específicos encontrados en el texto.
    // ──────────────────────────────────────────────────────
    static extractUserFilters(content: string): UserSearchFilters {
        const lower = content.toLowerCase();
        const filters: UserSearchFilters = {};

        // Eliminamos las palabras de comando para quedarnos con el tema
        const cleanQuery = lower
            .replace(
                /\b(busca|buscar|muéstrame|muestrame|encuentra|estudiantes?|alumnos?|compañeros?|personas?|interesados?|interesadas?|de la|de los|de las|del|que estudian?|quienes?|quiénes?|están?|esta en|estan en|gente)\b/gi,
                " "
            )
            .replace(/\s{2,}/g, " ")
            .trim();

        // Universidad
        if (UNIVERSITY_KW.some((kw) => lower.includes(kw))) {
            // Extraer el nombre de la universidad del texto limpio
            const uniMatch = lower.match(
                /\b(upn|uni|usmp|pucp|upc|unmsm|utp|udep|unsaac|unsa|uncp|universidad\s+\w+(\s+\w+)?)\b/i
            );
            filters.university = uniMatch ? uniMatch[0].trim() : cleanQuery;
            return filters;
        }

        // Facultad
        if (FACULTY_KW.some((kw) => lower.includes(kw))) {
            filters.faculty = cleanQuery;
            return filters;
        }

        // Ciclo / Semestre
        if (CYCLE_KW.some((kw) => lower.includes(kw))) {
            const cycleMatch = lower.match(/(\d+)[°º]?\s*(ciclo|semestre)/i) ||
                lower.match(/(primer|segundo|tercer|cuarto|quinto|sexto|séptimo|octavo|noveno|décimo)\s*(ciclo|semestre)/i);
            filters.academic_cycle = cycleMatch ? cycleMatch[0].trim() : cleanQuery;
            return filters;
        }

        // Interés académico (antes que carrera para evitar colisiones)
        const matchedInterest = INTEREST_KW.find((kw) => lower.includes(kw));
        if (matchedInterest) {
            filters.interest = matchedInterest;
            return filters;
        }

        // Carrera
        const matchedCareer = CAREER_KW.find((kw) => lower.includes(kw));
        if (matchedCareer) {
            // Si el match es genérico ("ingeniería"), usar la frase completa
            filters.career = matchedCareer.length > 5 ? matchedCareer : cleanQuery;
            return filters;
        }

        // Distrito / Ciudad (ubicación)
        const matchedDistrict = DISTRICT_KW.find((kw) => lower.includes(kw));
        if (matchedDistrict) {
            filters.district = matchedDistrict;
            return filters;
        }

        // Término genérico — buscamos en todos los campos
        if (cleanQuery.length > 1) {
            filters.generic = cleanQuery;
        }

        return filters;
    }
}
