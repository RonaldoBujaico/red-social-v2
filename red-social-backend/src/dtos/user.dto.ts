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
};
