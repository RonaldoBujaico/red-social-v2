import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { User } from "./User";

@Entity("user_interests")
export class UserInterest {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.interests, {
        nullable: false,
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ type: "varchar", length: 150, nullable: false })
    interestName!: string;
}
