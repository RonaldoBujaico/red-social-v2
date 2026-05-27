import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany
} from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";
import { Reaction } from "./Reaction";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "text", nullable: false })
    content!: string;

    @Column({ type: "varchar", length: 20, default: "public" })
    visibility!: "public" | "friends" | "private";

    @Column({ type: "datetime" })
    createdAt!: Date;

    /*El post para crear imagen con url*/
    @Column({ type: "varchar", length: 255, nullable: true })
    imageUrl!: string | null;

    @ManyToOne(() => User, (user) => user.posts, {
        nullable: false,
        onDelete: "NO ACTION"

    })
    user!: User;

    @OneToMany(() => Comment, (comment) => comment.post)
    comments!: Comment[];

    @OneToMany(() => Reaction, (reaction) => reaction.post)
    reactions!: Reaction[];
}