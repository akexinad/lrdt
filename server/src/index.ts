import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
// Package required for type graphql to work.
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { COOKIE_NAME, __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import { SESSION_COOKIE } from "./priv";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

const main = async () => {
    // sendEmail("danixeka@gmail.com", "hello");

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
    const redis = Redis();



    app.use(
        cors({
            origin: "http://localhost:3000",
            credentials: true
        })
    );

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
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
            res,
            redis
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
