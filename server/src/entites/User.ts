import { Field, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { Post } from "./Post";
import { Upvote } from "./Upvote";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn({ type: "int" })
    id!: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field()
    @Column({ unique: true })
    username!: string;

    @Field()
    @Column({ unique: true })
    email!: string;

    // You cannot select the password on graphql
    @Column()
    password!: string;

    @Field(() => [Post], { nullable: true })
    @OneToMany(() => Post, (post) => post.creator)
    posts: Post[];

    @Field(() => [Upvote], { nullable: true })
    @OneToMany(() => Upvote, (upvote) => upvote.user)
    upvotes: Upvote[];
}
