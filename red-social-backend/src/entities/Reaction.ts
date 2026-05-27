import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    Unique,
    JoinColumn
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity()
@Unique(["user", "post"]) 
export class Reaction {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 20, nullable: false })
    type!: string; 

    @ManyToOne(() => User, {
        nullable: false,
        onDelete: "NO ACTION"
    })
    @JoinColumn({ name: "userId" })
    user!: User;

    @ManyToOne(() => Post, {
        nullable: false,
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "postId" })
    post!: Post;
}