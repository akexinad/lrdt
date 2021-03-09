import { Post } from "../entites/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
    @Query(() => Post, { nullable: true })
    post(
        @Arg("id", () => Int) id: number,
        @Ctx() ctx: MyContext
    ): Promise<Post | null> {
        return ctx.em.findOne(Post, { id });
    }

    @Query(() => [Post])
    posts(@Ctx() ctx: MyContext): Promise<Post[]> {
        return ctx.em.find(Post, {});
    }

    @Mutation(() => Post)
    async createPost(
        @Arg("title", () => String) title: string,
        @Ctx() ctx: MyContext
    ): Promise<Post> {
        const post = ctx.em.create(Post, { title });

        await ctx.em.persistAndFlush(post);

        return post;
    }

    @Mutation(() => Post)
    async updatePost(
        @Arg("id") id: number,
        @Arg("title", () => String, { nullable: true }) title: string,
        @Ctx() ctx: MyContext
    ): Promise<Post | null> {
        const post = await ctx.em.findOne(Post, { id });

        if (!post) return null;

        if (!title) return post;

        post.title = title;

        await ctx.em.persistAndFlush(post);

        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(
        @Arg("id") id: number,
        @Ctx() ctx: MyContext
    ): Promise<boolean> {
        const postToDelete = await ctx.em.findOne(Post, { id });

        if (!postToDelete) {
            return false;
        }

        await ctx.em.nativeDelete(Post, { id: postToDelete.id });
        
        return true;
    }
}
