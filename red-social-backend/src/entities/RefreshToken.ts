import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 500 })
    token!: string;

    @Column({ type: "datetime" })
    expiresAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ type: "varchar", length: 255, nullable: true })
    ip!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    os!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    type!: string;

    @Column({ type: "bit", default: false })
    isTrusted!: boolean;

    @Column({ type: "varchar", length: 255, nullable: true })
    browser!: string;

    @ManyToOne(() => User, (user) => user.id, {
        onDelete: "CASCADE",
    })
    user!: User;
}
