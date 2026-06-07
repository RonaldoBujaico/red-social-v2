import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany
} from "typeorm";
import { User } from "./User";
import { ChatbotMessage } from "./ChatbotMessage";

@Entity("chatbot_conversations")
export class ChatbotConversation {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, {
        nullable: false,
        onDelete: "CASCADE"
    })
    user!: User;

    @Column({ type: "varchar", length: 255, default: "Consulta Académica" })
    title!: string;

    @Column({ type: "datetime", default: () => "GETDATE()" })
    createdAt!: Date;

    @Column({ type: "datetime", default: () => "GETDATE()" })
    updatedAt!: Date;

    @OneToMany(() => ChatbotMessage, (message) => message.conversation)
    messages!: ChatbotMessage[];
}
