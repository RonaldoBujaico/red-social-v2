export interface User {
    id: number;
    email: string;
    role: string;
    profile: UserProfile;
    interests?: { id: number; interestName: string }[];
    skills?: { id: number; skillName: string }[];
    courses?: { id: number; courseName: string }[];
    researchTopics?: { id: number; topicName: string }[];
}

/*Reaciones sobre post*/
export interface Comment {
    id: number;
    content: string;
    createdAt?: string;
    user?: User;
}

export interface Reaction {
    id: number;
    type?: string;
}


export interface Post {
    id: number;
    content: string;
    createdAt: string;
    imageUrl?: string | null;
    visibility?: "public" | "friends" | "private";
    user: User;


    comments?: Comment[];
    reactions?: Reaction[];
}


export interface UserProfile {
    avatar: string;
    firstName: string;
    lastName: string;
    username: string;
    bio?: string | null;
    coverImage?: string | null;
    birthDate?: string | null;
    gender?: "male" | "female" | "other" | null;
    career?: string | null;
    cycle?: string | null;
    phone?: string | null;
    hobbies?: string | null;

    // Nuevos campos académicos y geográficos
    university?: string | null;
    faculty?: string | null;
    academic_cycle?: string | null;
    country?: string | null;
    department?: string | null;
    province?: string | null;
    district?: string | null;
    biography?: string | null;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}
