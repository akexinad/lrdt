import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entites/Post";
import mikroOrmConfig from "./mikro-orm.config";

const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);

    // automatically run the migrations
    orm.getMigrator().up();

    const post = orm.em.create(Post, {
        title: "my first post"
    });

    await orm.em.persistAndFlush(post);
    

    // delete posts;
    const posts = await orm.em.find(Post, {});

    console.log('posts', posts)
};

main().catch((err) => console.log(err));
