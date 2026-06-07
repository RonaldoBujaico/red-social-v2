export type CreateUserDto = {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    birthDate: Date;
    gender: "male" | "female" | "other";
    bio?: string;
    career?: string;
    cycle?: string;
    phone?: string;
    hobbies?: string;
    avatar?: string;
    isActive?: boolean;
    role: "user" | "admin" | "moderator";

    // Nuevos campos académicos y geográficos
    university?: string;
    faculty?: string;
    academic_cycle?: string;
    country?: string;
    department?: string;
    province?: string;
    district?: string;
    biography?: string;

    // Relaciones indirectas de strings
    interests?: string[];
    skills?: string[];
    courses?: string[];
    researchTopics?: string[];
};

export type UpdateUserDto = {
    email?: string;
    password?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    birthDate?: Date;
    gender?: "male" | "female" | "other";
    bio?: string;
    career?: string;
    cycle?: string;
    phone?: string;
    hobbies?: string;
    avatar?: string;
    isActive?: boolean;
    isBanned?: boolean;
    role?: "user" | "admin" | "moderator";

    // Nuevos campos académicos y geográficos
    university?: string;
    faculty?: string;
    academic_cycle?: string;
    country?: string;
    department?: string;
    province?: string;
    district?: string;
    biography?: string;

    // Relaciones indirectas de strings
    interests?: string[];
    skills?: string[];
    courses?: string[];
    researchTopics?: string[];
};
