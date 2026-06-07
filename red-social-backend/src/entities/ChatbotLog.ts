import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne
} from "typeorm";
import { User } from "./User";

@Entity("chatbot_logs")
export class ChatbotLog {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, {
        nullable: true,
        onDelete: "SET NULL"
    })
    user!: User | null;

    @Column({ type: "varchar", length: 100, nullable: false })
    action!: string;

    @Column({ type: "text", nullable: false })
    query!: string;

    @Column({ type: "varchar", length: 50, nullable: true })
    ipAddress!: string | null;

    @Column({ type: "datetime", default: () => "GETDATE()" })
    createdAt!: Date;
}
