import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne
} from "typeorm";
import { User } from "./User";

@Entity("chatbot_reports")
export class ChatbotReport {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, {
        nullable: false,
        onDelete: "CASCADE"
    })
    user!: User;

    @Column({ type: "varchar", length: 50, nullable: false })
    type!: "spam" | "offensive" | "harassment" | "inappropriate";

    @Column({ type: "text", nullable: false })
    flaggedContent!: string;

    @Column({ type: "varchar", length: 20, default: "pending" })
    status!: "pending" | "resolved" | "dismissed";

    @Column({ type: "datetime", default: () => "GETDATE()" })
    createdAt!: Date;

    @Column({ type: "datetime", nullable: true })
    resolvedAt!: Date | null;
}
