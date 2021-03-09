/**
 * package required for type graphql to work.
 */
import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import express from "express";
import { buildSchema } from "type-graphql";
import { __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);

    // automatically run the migrations
    await orm.getMigrator().up();

    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false
        }),
        context: () => ({
            em: orm.em
        })
    });

    apolloServer.applyMiddleware({ app })

    app.listen(5000, () => {
        console.log("listening on http://localhost:5000/graphql");
    });
};

main().catch((err) => console.log(err));
