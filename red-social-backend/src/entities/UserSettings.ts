import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("user_settings")
export class UserSettings {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "bit", default: false })
    privateAccount!: boolean;

    @Column({ type: "bit", default: true })
    showOnlineStatus!: boolean;

    @Column({ type: "bit", default: true })
    emailNotifications!: boolean;

    @Column({ type: "bit", default: true })
    pushNotifications!: boolean;

    @Column({ type: "bit", default: true })
    likeNotifications!: boolean;

    @Column({ type: "bit", default: true })
    commentNotifications!: boolean;

    @Column({ type: "bit", default: true })
    friendRequestNotifications!: boolean;

    @Column({ type: "varchar", length: 20, default: "dark" })
    theme!: "dark" | "light";

    @OneToOne(() => User, {
        nullable: false,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "userId" })
    user!: User;
}