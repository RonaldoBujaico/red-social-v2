import { AppDataSource } from "../config/data-source";
import { Brackets } from "typeorm";
import { CreateUserDto } from "../dtos/user.dto";
import { User } from "../entities/User";
import { UserProfile } from "../entities/UserProfile";
import { FriendRequest } from "../entities/FriendRequest";
import { UserInterest } from "../entities/UserInterest";
import { UserSkill } from "../entities/UserSkill";
import { UserCourse } from "../entities/UserCourse";
import { UserResearchTopic } from "../entities/UserResearchTopic";
import { AppError } from "../errors/AppError";
import { ErrorCode } from "../utils/errorCodes";
import { hashPassword } from "../utils/hash";
import { HttpStatus } from "../utils/httpStatus";
import { validateUserFormat } from "../utils/validators";

const userRepo = AppDataSource.getRepository(User);
const profileRepo = AppDataSource.getRepository(UserProfile);
const friendRequestRepo = AppDataSource.getRepository(FriendRequest);
const interestRepo = AppDataSource.getRepository(UserInterest);
const skillRepo = AppDataSource.getRepository(UserSkill);
const courseRepo = AppDataSource.getRepository(UserCourse);
const topicRepo = AppDataSource.getRepository(UserResearchTopic);

const removePassword = (user: User) => {
    const safeUser = { ...user } as any;
    delete safeUser.password;
    return safeUser;
};

export const createUser = async (data: CreateUserDto) => {
    validateUserFormat(data);

    const existingEmail = await userRepo.findOne({
        where: { email: data.email },
    });

    if (existingEmail) {
        throw new AppError(
            "El correo ya está registrado",
            HttpStatus.CONFLICT,
            ErrorCode.USER_ALREADY_EXISTS,
        );
    }

    const existingUsername = await profileRepo.findOne({
        where: { username: data.username },
    });

    if (existingUsername) {
        throw new AppError(
            "El nombre de usuario ya está en uso",
            HttpStatus.CONFLICT,
            ErrorCode.USER_ALREADY_EXISTS,
        );
    }

    const hashedPassword = await hashPassword(data.password);

    const user = userRepo.create({
        email: data.email,
        password: hashedPassword,
        role: data.role || "user",
        profile: {
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            birthDate: data.birthDate,
            gender: data.gender,
            bio: data.bio,
            avatar: data.avatar,
        },
    });

    await userRepo.save(user);

    return removePassword(user);
};

export const getUsers = async () => {
    const users = await userRepo.find({
        relations: ["profile"],
    });

    return users.map((user) => removePassword(user));
};

export const getUserById = async (id: number) => {
    const user = await userRepo.findOne({
        where: { id },
        relations: ["profile", "interests", "skills", "courses", "researchTopics"],
    });

    if (!user) {
        throw new AppError(
            "Usuario no encontrado",
            HttpStatus.NOT_FOUND,
            ErrorCode.USER_NOT_FOUND,
        );
    }

    return removePassword(user);
};

export const updateUser = async (id: number, data: Partial<CreateUserDto>) => {
    const user = await userRepo.findOne({
        where: { id },
        relations: ["profile", "interests", "skills", "courses", "researchTopics"],
    });

    if (!user) {
        throw new AppError(
            "Usuario no encontrado",
            HttpStatus.NOT_FOUND,
            ErrorCode.USER_NOT_FOUND,
        );
    }

    if (data.email && data.email !== user.email) {
        const exists = await userRepo.findOne({
            where: { email: data.email },
        });

        if (exists) {
            throw new AppError(
                "El correo ya está en uso",
                HttpStatus.CONFLICT,
                ErrorCode.USER_ALREADY_EXISTS,
            );
        }

        user.email = data.email;
    }

    if (data.password) {
        user.password = await hashPassword(data.password);
    }

    if (data.username && data.username !== user.profile.username) {
        const exists = await profileRepo.findOne({
            where: { username: data.username },
        });

        if (exists) {
            throw new AppError(
                "El nombre de usuario ya está en uso",
                HttpStatus.CONFLICT,
                ErrorCode.USER_ALREADY_EXISTS,
            );
        }

        user.profile.username = data.username;
    }

    // Actualizar campos básicos
    user.profile.firstName = data.firstName ?? user.profile.firstName;
    user.profile.lastName = data.lastName ?? user.profile.lastName;
    user.profile.birthDate = data.birthDate ?? user.profile.birthDate;
    user.profile.gender = data.gender ?? user.profile.gender;
    user.profile.bio = data.bio ?? user.profile.bio;
    user.profile.phone = data.phone !== undefined ? data.phone : user.profile.phone;
    user.profile.hobbies = data.hobbies !== undefined ? data.hobbies : user.profile.hobbies;
    user.profile.avatar = data.avatar ?? user.profile.avatar;

    // Actualizar nuevos campos académicos y geográficos
    user.profile.university = data.university !== undefined ? data.university : user.profile.university;
    user.profile.faculty = data.faculty !== undefined ? data.faculty : user.profile.faculty;
    user.profile.career = data.career !== undefined ? data.career : user.profile.career;
    user.profile.cycle = data.cycle !== undefined ? data.cycle : user.profile.cycle;
    user.profile.academic_cycle = data.academic_cycle !== undefined ? data.academic_cycle : user.profile.academic_cycle;
    user.profile.country = data.country !== undefined ? data.country : user.profile.country;
    user.profile.department = data.department !== undefined ? data.department : user.profile.department;
    user.profile.province = data.province !== undefined ? data.province : user.profile.province;
    user.profile.district = data.district !== undefined ? data.district : user.profile.district;
    user.profile.biography = data.biography !== undefined ? data.biography : user.profile.biography;

    // Guardar primero el usuario para persistir cambios en profile
    await userRepo.save(user);

    // Actualizar relaciones transaccionales OneToMany
    if (data.interests !== undefined) {
        await interestRepo.delete({ user: { id } });
        const newInterests = data.interests.map(name => interestRepo.create({ interestName: name, user }));
        await interestRepo.save(newInterests);
    }
    if (data.skills !== undefined) {
        await skillRepo.delete({ user: { id } });
        const newSkills = data.skills.map(name => skillRepo.create({ skillName: name, user }));
        await skillRepo.save(newSkills);
    }
    if (data.courses !== undefined) {
        await courseRepo.delete({ user: { id } });
        const newCourses = data.courses.map(name => courseRepo.create({ courseName: name, user }));
        await courseRepo.save(newCourses);
    }
    if (data.researchTopics !== undefined) {
        await topicRepo.delete({ user: { id } });
        const newTopics = data.researchTopics.map(name => topicRepo.create({ topicName: name, user }));
        await topicRepo.save(newTopics);
    }

    // Refrescar y retornar con relaciones actualizadas
    const updatedUser = await userRepo.findOne({
        where: { id },
        relations: ["profile", "interests", "skills", "courses", "researchTopics"],
    });

    return removePassword(updatedUser!);
};

export const deleteUser = async (id: number) => {
    const user = await userRepo.findOne({ where: { id } });

    if (!user) {
        throw new AppError(
            "Usuario no encontrado",
            HttpStatus.NOT_FOUND,
            ErrorCode.USER_NOT_FOUND,
        );
    }

    await userRepo.remove(user);

    return true;
};

export const searchUsers = async (query: string, currentUserId: number) => {
    const search = query.trim();

    if (!search) {
        return [];
    }

    const users = await userRepo
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.profile", "profile")
        .where("user.id != :currentUserId", { currentUserId })
        .andWhere(
            new Brackets((qb) => {
                qb.where("profile.username LIKE :search", {
                    search: `%${search}%`,
                })
                    .orWhere("profile.firstName LIKE :search", {
                        search: `%${search}%`,
                    })
                    .orWhere("profile.lastName LIKE :search", {
                        search: `%${search}%`,
                    })
                    .orWhere("user.email LIKE :search", {
                        search: `%${search}%`,
                    });
            }),
        )
        .take(8)
        .getMany();

    return users.map((user) => removePassword(user));
};

export const sendFriendRequest = async (
    senderId: number,
    receiverId: number,
) => {
    if (senderId === receiverId) {
        throw new AppError(
            "No puedes enviarte una solicitud a ti mismo",
            HttpStatus.BAD_REQUEST,
        );
    }

    const sender = await userRepo.findOne({
        where: { id: senderId },
        relations: ["profile"],
    });

    if (!sender) {
        throw new AppError(
            "Usuario emisor no encontrado",
            HttpStatus.NOT_FOUND,
            ErrorCode.USER_NOT_FOUND,
        );
    }

    const receiver = await userRepo.findOne({
        where: { id: receiverId },
        relations: ["profile"],
    });

    if (!receiver) {
        throw new AppError(
            "Usuario receptor no encontrado",
            HttpStatus.NOT_FOUND,
            ErrorCode.USER_NOT_FOUND,
        );
    }

    const existingRequest = await friendRequestRepo.findOne({
        where: [
            {
                sender: { id: senderId },
                receiver: { id: receiverId },
            },
            {
                sender: { id: receiverId },
                receiver: { id: senderId },
            },
        ],
        relations: ["sender", "sender.profile", "receiver", "receiver.profile"],
    });

    if (existingRequest) {
        if (existingRequest.status === "pending") {
            throw new AppError(
                "Ya existe una solicitud pendiente entre estos usuarios",
                HttpStatus.CONFLICT,
            );
        }

        if (existingRequest.status === "accepted") {
            throw new AppError(
                "Ya son amigos",
                HttpStatus.CONFLICT,
            );
        }

        existingRequest.sender = sender;
        existingRequest.receiver = receiver;
        existingRequest.status = "pending";

        await friendRequestRepo.save(existingRequest);

        return existingRequest;
    }

    const friendRequest = friendRequestRepo.create({
        sender,
        receiver,
        status: "pending",
    });

    await friendRequestRepo.save(friendRequest);

    return friendRequest;
};

export const getReceivedFriendRequests = async (userId: number) => {
    const requests = await friendRequestRepo.find({
        where: {
            receiver: {
                id: userId,
            },
            status: "pending",
        },
        relations: [
            "sender",
            "sender.profile",
            "receiver",
            "receiver.profile",
        ],
        order: {
            createdAt: "DESC",
        },
    });

    return requests.map((request) => ({
        ...request,
        sender: removePassword(request.sender),
        receiver: removePassword(request.receiver),
    }));
};

export const respondFriendRequest = async (
    requestId: number,
    userId: number,
    status: "accepted" | "rejected",
) => {
    const request = await friendRequestRepo.findOne({
        where: {
            id: requestId,
        },
        relations: [
            "sender",
            "sender.profile",
            "receiver",
            "receiver.profile",
        ],
    });

    if (!request) {
        throw new AppError("Solicitud no encontrada", HttpStatus.NOT_FOUND);
    }

    if (request.receiver.id !== userId) {
        throw new AppError("No autorizado", HttpStatus.FORBIDDEN);
    }

    if (request.status !== "pending") {
        throw new AppError(
            "Esta solicitud ya fue respondida",
            HttpStatus.BAD_REQUEST,
        );
    }

    request.status = status;

    await friendRequestRepo.save(request);

    return {
        ...request,
        sender: removePassword(request.sender),
        receiver: removePassword(request.receiver),
    };
};

export const getAcceptedFriends = async (userId: number) => {
    const acceptedRequests = await friendRequestRepo.find({
        where: [
            {
                sender: {
                    id: userId,
                },
                status: "accepted",
            },
            {
                receiver: {
                    id: userId,
                },
                status: "accepted",
            },
        ],
        relations: [
            "sender",
            "sender.profile",
            "receiver",
            "receiver.profile",
        ],
        order: {
            createdAt: "DESC",
        },
    });

    const friends = acceptedRequests.map((request) => {
        const friend =
            request.sender.id === userId ? request.receiver : request.sender;

        return removePassword(friend);
    });

    return friends;
};
export const getSuggestedUsers = async (currentUserId: number) => {
    const users = await userRepo
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.profile", "profile")
        .where("user.id != :currentUserId", { currentUserId })
        .take(12)
        .getMany();

    const filteredUsers = [];

    for (const user of users) {
        const existingRequest = await friendRequestRepo.findOne({
            where: [
                {
                    sender: { id: currentUserId },
                    receiver: { id: user.id },
                },
                {
                    sender: { id: user.id },
                    receiver: { id: currentUserId },
                },
            ],
        });

        if (!existingRequest || existingRequest.status === "rejected") {
            filteredUsers.push(removePassword(user));
        }
    }

    return filteredUsers.slice(0, 3);
};