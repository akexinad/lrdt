import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { __prod__ } from "./constants";
import { Post } from "./entites/Post";
import { DB_PASS, DB_USER } from "./priv";

export default {
    dbName: "lrdt",
    type: "postgresql",
    user: DB_USER,
    // user: "postgres",
    password: DB_PASS,
    // password: "psql1234",
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
