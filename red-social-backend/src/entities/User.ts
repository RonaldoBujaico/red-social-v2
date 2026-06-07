import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    OneToMany,
} from "typeorm";
import { UserProfile } from "./UserProfile";
import { Post } from "./Post";
import { Follow } from "./Follow";
import { UserInterest } from "./UserInterest";
import { UserSkill } from "./UserSkill";
import { UserCourse } from "./UserCourse";
import { UserResearchTopic } from "./UserResearchTopic";

@Entity("user")
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 150, unique: true, nullable: false })
    email!: string;

    @Column({ type: "varchar", length: 255, nullable: false })
    password!: string;

    @Column({ type: "bit", default: false })
    isActive!: boolean;

    @Column({ type: "bit", default: false })
    isBanned!: boolean;

    @Column({
        type: "varchar",
        default: "user",
    })
    role!: "user" | "admin" | "moderator";

    @OneToOne(() => UserProfile, (profile) => profile.user, {
        cascade: true,
        nullable: true,
        onDelete: "CASCADE",
    })
    profile!: UserProfile;

    @OneToMany(() => Post, (post) => post.user)
    posts!: Post[];

    @OneToMany(() => Follow, (follow) => follow.follower)
    following!: Follow[];

    @OneToMany(() => Follow, (follow) => follow.following)
    followers!: Follow[];

    @OneToMany(() => UserInterest, (interest) => interest.user, { cascade: true })
    interests!: UserInterest[];

    @OneToMany(() => UserSkill, (skill) => skill.user, { cascade: true })
    skills!: UserSkill[];

    @OneToMany(() => UserCourse, (course) => course.user, { cascade: true })
    courses!: UserCourse[];

    @OneToMany(() => UserResearchTopic, (topic) => topic.user, { cascade: true })
    researchTopics!: UserResearchTopic[];
}
