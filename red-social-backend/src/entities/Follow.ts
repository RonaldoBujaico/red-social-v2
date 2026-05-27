import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from "typeorm";
import { User } from "./User";

@Entity()
@Unique(["follower", "following"])
export class Follow {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.following, {
        onDelete: "NO ACTION"
    })
    follower!: User;

    @ManyToOne(() => User, (user) => user.followers, {
        onDelete: "NO ACTION"
    })
    following!: User;
}