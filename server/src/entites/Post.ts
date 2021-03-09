import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Post {
    @Field(() => Int)
    /**
     * The decorators turn the property into a db column.
     * Without the decorator, they are just simple class properties.
     */
    @PrimaryKey()
    id!: number;

    /**
     * If there's a field that you do not want to expose to graphql,
     * just don't add the field decorator
     */
    @Field(() => String)
    @Property({ type: "date" })
    createdAt = new Date();

    @Field(() => String)
    @Property({ type: "date", onUpdate: () => new Date() })
    updatedAt = new Date();

    @Field(() => String)
    @Property({ type: "text" })
    title: string;
}
