import { CreateUserDto } from "../dtos/user.dto";
import { RegisterDto } from "../dtos/auth.dto";
import { AppError } from "../errors/AppError";

export const validateUserFormat = (data: RegisterDto | CreateUserDto) => {
    if (data.password.length < 6) {
        throw new AppError("Password muy corta");
    }

    if (data.birthDate) {
        const birth = new Date(data.birthDate);
        if (birth >= new Date()) {
            throw new AppError("Fecha de nacimiento inválida");
        }
    }

    const validGenders = ["male", "female", "other"];
    if (data.gender && !validGenders.includes(data.gender)) {
        throw new AppError("Género inválido");
    }
};

export const validateUpnEmail = (email: string) => {
    if (!email.endsWith("@upn.pe")) {
        throw new AppError("Solo correos institucionales @upn.pe");
    }
};

/*
export const validateUserData = async (
    data: CreateUserDto | RegisterDto,
    userRepo: Repository<User>,
    profileRepo: Repository<UserProfile>,
) => {
    if (!isValidUpnEmail(data.email)) {
        throw new AppError("Solo correos institucionales @upn.pe", 409);
    }

    const existingEmail = await userRepo.findOne({
        where: { email: data.email },
    });

    if (existingEmail) {
        throw new AppError("Email ya registrado", 409);
    }

    const existingUsername = await profileRepo.findOne({
        where: { username: data.username },
    });

    if (existingUsername) {
        throw new AppError("Username ya está en uso");
    }

    if (data.password.length < 6) {
        throw new AppError("La contraseña debe tener al menos 6 caracteres");
    }

    if (data.birthDate) {
        const birth = new Date(data.birthDate);
        if (birth >= new Date()) {
            throw new AppError("Fecha de nacimiento inválida");
        }
    }

    const validGenders = ["male", "female", "other"];
    if (data.gender && !validGenders.includes(data.gender)) {
        throw new Error("Género inválido");
    }
};*/

const isValidUpnEmail = (email: string) => {
    return /^[a-zA-Z0-9._%+-]+@upn\.pe$/.test(email);
};
