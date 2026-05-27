import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";
import { Comment } from "./Comment";

@Entity("report")
export class Report {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
    reporter!: User;

    @Column({ type: "varchar", length: 100, nullable: false })
    reason!: string;

    @Column({ type: "text", nullable: true })
    description?: string;

    @Column({
        type: "varchar",
        length: 20,
        default: "pending",
    })
    status!: "pending" | "resolved" | "dismissed";

    @ManyToOne(() => User, { nullable: true, onDelete: "NO ACTION" })
    reportedUser?: User | null;

    @ManyToOne(() => Post, { nullable: true, onDelete: "NO ACTION" })
    reportedPost?: Post | null;

    @ManyToOne(() => Comment, { nullable: true, onDelete: "NO ACTION" })
    reportedComment?: Comment | null;

    @CreateDateColumn({ type: "datetime" })
    createdAt!: Date;

    @Column({ type: "datetime", nullable: true })
    resolvedAt?: Date | null;

    @ManyToOne(() => User, { nullable: true, onDelete: "NO ACTION" })
    resolvedBy?: User | null;
}
