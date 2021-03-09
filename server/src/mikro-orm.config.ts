import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { __prod__ } from "./constants";
import { Post } from "./entites/Post";

export default {
    dbName: "lrdt",
    type: "postgresql",
    // user: process.env.DB_USER,
    user: "postgres",
    // password: process.env.DB_PASS,
    password: "psql1234",
    // remove debug option when in production
    debug: !__prod__,
    entities: [Post],
    migrations: {
        path: path.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/
    }
} as Parameters<typeof MikroORM.init>[0];
/**
 * The type becomes more specific when you
 * cast this to a const
 */
