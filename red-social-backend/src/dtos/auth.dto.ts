export type RegisterDto = {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    birthDate: Date;
    gender: "male" | "female" | "other";
    bio?: string;
    avatar?: string;
    isActive?: boolean;
    role: "user";
};

export type LoginDto = {
    email: string;
    password: string;
};

export type DataEmail =  {
    email:string
}