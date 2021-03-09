import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Post {
    /**
     * The decorators turn the property into a db column.
     * Without the decorator, they are just simple class properties.
     */
    @PrimaryKey()
    id!: number;

    @Property({ type: "date" })
    createdAt = new Date();

    @Property({ type: "date", onUpdate: () => new Date() })
    updatedAt = new Date();

    @Property({ type: "text" })
    title: string;
}
