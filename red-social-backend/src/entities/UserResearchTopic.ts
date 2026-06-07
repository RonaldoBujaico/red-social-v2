import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { User } from "./User";

@Entity("user_research_topics")
export class UserResearchTopic {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.researchTopics, {
        nullable: false,
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ type: "varchar", length: 150, nullable: false })
    topicName!: string;
}
