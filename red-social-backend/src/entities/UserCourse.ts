import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { User } from "./User";

@Entity("user_courses")
export class UserCourse {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.courses, {
        nullable: false,
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ type: "varchar", length: 150, nullable: false })
    courseName!: string;
}
