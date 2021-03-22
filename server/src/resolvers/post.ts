import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    InputType,
    Int,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root,
    UseMiddleware
} from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entites/Post";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types/types";

@InputType()
class CreatePostOptions {
    @Field()
    title: string;

    @Field()
    text: string;
}

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];

    @Field()
    hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
    /**
     * Instead of sending all the text, we only send a
     * snippet of the text.
     */
    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return root.text.length > 50
            ? root.text.slice(0, 50) + "..."
            : root.text;
    }

    @Query(() => Post, { nullable: true })
    post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
        return getConnection()
            .getRepository(Post)
            .createQueryBuilder("post")
            .leftJoinAndSelect("post.creator", "user")
            .leftJoinAndSelect("post.upvotes", "upvote")
            .where("post.id = :id", { id })
            .getOne();
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
        @Ctx() ctx: MyContext
    ): Promise<PaginatedPosts> {
        const realLimit = Math.min(50, limit);

        const realLimitPlusOne = realLimit + 1;

        const queryBuilder = getConnection()
            // .getRepository(Post)
            .createQueryBuilder(Post, "post")
            .leftJoinAndSelect("post.creator", "user")
            .leftJoinAndSelect("post.upvotes", "upvote")
            /**
             * When dealing with camelCased variables you might need to
             * use double quotes when you using the variable independently.
             */
            .orderBy("post.createdAt", "DESC")
            .take(realLimitPlusOne);

        if (cursor) {
            queryBuilder.where("post.createdAt < :cursor", {
                cursor: new Date(+cursor)
            });
        }

        /**
         * Checking if the post has been updated by current user.
         */
        const userId = ctx.req.session.userId;
        const postsCollection = await queryBuilder.getMany();

        const hasMore = postsCollection.length === realLimitPlusOne;

        /**
         * No need to update the vote status since no user is logged in.
         */
        if (!userId) {
            return {
                posts: postsCollection,
                hasMore
            };
        }

        const postsWithVoteStatus = postsCollection.map((post) => {
            const existingUpvote = post.upvotes.find(
                (upvote) => upvote.userId === userId
            );

            if (!existingUpvote) {
                post.voteStatus = null;
                return post;
            }

            post.voteStatus = existingUpvote.value;
            return post;
        });

        return {
            posts: postsWithVoteStatus.slice(0, realLimit),
            hasMore
        };
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth) // check if user is authenticated
    async createPost(
        @Arg("options", () => CreatePostOptions) options: CreatePostOptions,
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
