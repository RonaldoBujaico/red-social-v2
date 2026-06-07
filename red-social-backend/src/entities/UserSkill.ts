import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { User } from "./User";

@Entity("user_skills")
export class UserSkill {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.skills, {
        nullable: false,
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ type: "varchar", length: 150, nullable: false })
    skillName!: string;
}
