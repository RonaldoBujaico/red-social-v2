import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "text", nullable: false })
    content!: string;

    @Column({ type: "bit", default: false })
    isRead!: boolean;

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