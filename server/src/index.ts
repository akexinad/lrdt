/**
 * package required for type graphql to work.
 */
import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import express from "express";
import session from "express-session";
import redis from "redis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import { SESSION_COOKIE } from "./priv";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import cors from "cors";

const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);

    // automatically run the migrations
    await orm.getMigrator().up();

    const app = express();

    /**
     * The order of the middleware is important.
     *
     * We need to access the session before the apollo server.
     */
    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    app.use(
        cors({
            origin: "http://localhost:3000",
            credentials: true
        })
    );

    app.use(
        session({
            name: "qid",
            store: new RedisStore({
                client: redisClient,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 4,
                httpOnly: true,
                sameSite: "lax", // csrf
                secure: __prod__ // cookie only works in https
            },
            saveUninitialized: false,
            secret: SESSION_COOKIE,
            resave: false
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({
            em: orm.em,
            req,
            res
        })
    });

    apolloServer.applyMiddleware({
        app,
        /**
         * You can use apollo to add cors policy,
         * but here we will use the cors package
         */
        cors: false
        // cors: { origin: "http://localhost:3000" }
    });

    app.listen(5000, () => {
        console.log("listening on http://localhost:5000/graphql");
    });
};

main().catch((err) => console.log(err));
