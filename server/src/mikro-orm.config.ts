import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { __prod__ } from "./constants";
import { Post } from "./entites/Post";
import { User } from "./entites/User";
import { DB_PASS, DB_USER } from "./priv";

export default {
    dbName: "lrdt",
    type: "postgresql",
    user: DB_USER,
    password: DB_PASS,
    // remove debug option when in production
    debug: !__prod__,
    entities: [Post, User],
    migrations: {
        path: path.join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/
    }
} as Parameters<typeof MikroORM.init>[0];
