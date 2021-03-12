import { Field, Int, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";

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

    /**
     * If there's a field that you do not want to expose to graphql,
     * just don't add the field decorator
     */
    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;

    @Field(() => String)
    @Column()
    title: string;
}
