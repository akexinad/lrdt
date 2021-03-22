import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import env from "dotenv";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata"; // Package required for type-graphql and type-orm to work.
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Post } from "./entites/Post";
import { Upvote } from "./entites/Upvote";
import { User } from "./entites/User";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

const main = async () => {
    env.config();

    await createConnection({
        url: process.env.DB_URL,
        type: "postgres",
        logging: true,
        synchronize: true,
        // ssl: {
        //     rejectUnauthorized: false
        // },
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [Post, User, Upvote]
    }).then((con) => con.runMigrations());

    const app = express();

    /**
     * The order of the middleware is important.
     *
     * We need to access the session before the apollo server.
     */
    const RedisStore = connectRedis(session);
    const redis = new Redis();

    app.use(
        cors({
            origin: "http://localhost:3001",
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
            secret: process.env.SESSION_SECRET,
            resave: false
        })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({
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

    app.listen(process.env.PORT, () => {
        console.log(
            `listening on http://localhost:${process.env.PORT}/graphql`
        );
    });
};

main().catch((err) => console.log(err));
