import { Field, Int, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field(() => Int)
    /**
     * The decorators turn the property into a db column.
     * Without the decorator, they are just simple class properties.
     */
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column()
    title!: string;

    @Field()
    @Column()
    text!: string;

    @Field()
    @Column({ type: "int", default: 0 })
    points!: number;

    @Field()
    @Column()
    creatorId: number;

    @ManyToOne(() => User, (user) => user.posts)
    creator: User;

    /**
     * If there's a column that you do not want to expose to graphql,
     * just don't add the field decorator
     */
    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}
