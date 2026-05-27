import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Unique,
} from "typeorm";
import { User } from "./User";

@Entity()
@Unique(["sender", "receiver"])
export class FriendRequest {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "varchar",
        length: 20,
        default: "pending",
    })
    status!: "pending" | "accepted" | "rejected";

    @ManyToOne(() => User, {
        nullable: false,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "senderId" })
    sender!: User;

    @ManyToOne(() => User, {
        nullable: false,
        onDelete: "NO ACTION",
    })
    @JoinColumn({ name: "receiverId" })
    receiver!: User;

    @CreateDateColumn({ type: "datetime" })
    createdAt!: Date;
}