import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne
} from "typeorm";
import { User } from "./User";

@Entity("chatbot_recommendations")
export class ChatbotRecommendation {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, {
        nullable: false,
        onDelete: "CASCADE"
    })
    user!: User;

    @Column({ type: "varchar", length: 20, nullable: false })
    type!: "post" | "user" | "group";

    @Column({ type: "int", nullable: false })
    itemId!: number;

    @Column({ type: "varchar", length: 255, nullable: false })
    reason!: string;

    @Column({ type: "datetime", default: () => "GETDATE()" })
    createdAt!: Date;
}
