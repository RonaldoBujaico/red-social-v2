import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne
} from "typeorm";
import { ChatbotConversation } from "./ChatbotConversation";

@Entity("chatbot_messages")
export class ChatbotMessage {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => ChatbotConversation, (conversation) => conversation.messages, {
        nullable: false,
        onDelete: "CASCADE"
    })
    conversation!: ChatbotConversation;

    @Column({ type: "varchar", length: 10, nullable: false })
    sender!: "user" | "bot";

    @Column({ type: "text", nullable: false })
    content!: string;

    @Column({ type: "datetime", default: () => "GETDATE()" })
    createdAt!: Date;
}
