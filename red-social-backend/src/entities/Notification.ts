import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity()
export class Notification {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 30, nullable: false })
    type!: "friend_request" | "like" | "comment" | "warning";

    @Column({ type: "varchar", length: 255, nullable: false })
    message!: string;

    @Column({ type: "bit", default: false })
    isRead!: boolean;

    @ManyToOne(() => User, {
        nullable: false,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "receiverId" })
    receiver!: User;

    @ManyToOne(() => User, {
        nullable: false,
        onDelete: "NO ACTION",
    })
    @JoinColumn({ name: "senderId" })
    sender!: User;

    @ManyToOne(() => Post, {
        nullable: true,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "postId" })
    post!: Post | null;

    @CreateDateColumn({ type: "datetime" })
    createdAt!: Date;
}