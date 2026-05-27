import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class VerificationToken {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 500 })
    token!: string;

    @Column({ type: "datetime" })
    expiresAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    user!: User;
}
