import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";

@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "text", nullable: false })
    content!: string;

    @Column({ type: "datetime", default: () => "GETDATE()" })
    createdAt!: Date;

    @ManyToOne(() => User, {
        nullable: false,
        onDelete: "CASCADE"
    })
    user!: User;

    @ManyToOne(() => Post, (post) => post.comments, {
        nullable: false,
        onDelete: "CASCADE"
    })
    post!: Post;
}