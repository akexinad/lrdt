import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entites/Post";
import mikroOrmConfig from "./mikro-orm.config";

const main = async () => {
    
    const orm = await MikroORM.init(mikroOrmConfig);

    // automatically run the migrations
    orm.getMigrator().up();

};

main().catch((err) => console.log(err));
