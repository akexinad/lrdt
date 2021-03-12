import { isAuth } from "../middleware/isAuth";
import { MyContext } from "src/types";
import {
    Arg,
    Ctx,
    Field,
    InputType,
    Int,
    Mutation,
    Query,
    Resolver,
    UseMiddleware
} from "type-graphql";
import { Post } from "../entites/Post";

@InputType()
class PostInput {
    @Field()
    title: string;

    @Field()
    text: string;
}

@Resolver()
export class PostResolver {
    @Query(() => Post, { nullable: true })
    post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
        return Post.findOne(id);
    }

    @Query(() => [Post])
    posts(): Promise<Post[]> {
        // await sleep(3000);
        return Post.find();
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth) // check if user is authenticated
    async createPost(
        @Arg("options", () => PostInput) options: PostInput,
        @Ctx() ctx: MyContext
    ): Promise<Post> {
        return Post.create({
            ...options,
            creatorId: ctx.req.session.userId
        }).save();
    }

    @Mutation(() => Post)
    async updatePost(
        @Arg("id") id: number,
        @Arg("title", () => String, { nullable: true }) title: string
    ): Promise<Post | null> {
        const post = await Post.findOne(id);

        if (!post) return null;

        if (!title) return post;

        post.title = title;

        await Post.update({ id }, { title });

        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(@Arg("id") id: number): Promise<boolean> {
        await Post.delete(id);

        return true;
    }
}
