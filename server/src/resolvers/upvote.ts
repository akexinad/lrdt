import {
    Arg,
    Ctx,
    Int,
    Mutation,
    Query,
    Resolver,
    UseMiddleware
} from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entites/Post";
import { Upvote } from "../entites/Upvote";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types/types";

@Resolver(Upvote)
export class UpvoteResolver {
    @Query(() => [Upvote])
    async upvotes(): Promise<Upvote[]> {
        return await getConnection()
            .getRepository(Upvote)
            .createQueryBuilder("upvote")
            .leftJoinAndSelect("upvote.user", "user")
            .leftJoinAndSelect("upvote.post", "post")
            .getMany();
    }

    @Query(() => Upvote)
    async upvote(
        @Arg("postId") postId: number,
        @Arg("userId") userId: number
    ): Promise<Upvote | null> {
        const upvote = await Upvote.findOne({ where: { postId, userId } });

        if (!upvote) return null;

        return upvote;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg("value", () => Int) value: number,
        @Arg("postId", () => Int) postId: number,
        @Ctx() ctx: MyContext
    ) {
        const { userId } = ctx.req.session;

    if (!userId) {
            ctx.res.status(401);
            throw new Error("Unauthorized");
        }

        const postToUpvote = await Post.findOne({ id: postId });

        if (!postToUpvote) {
            ctx.res.status(404).send("post not found");
            throw new Error("Post does not exist.");
        }

        if (value === 0) {
            return false;
        }

        // making sure user can only vote 1 or -1
        const vote = value > 0 ? 1 : -1;

        const existingUpvoteByUser = await Upvote.findOne({
            where: { userId, postId }
        });

        // new vote
        if (!existingUpvoteByUser) {
            await Upvote.insert({
                userId,
                postId,
                value: vote
            });

            await Post.update(
                { id: postId },
                { points: postToUpvote.points + vote }
            );

            return true;
        }

        // User wants to remove his vote.
        if (existingUpvoteByUser.value === vote) {
            await Upvote.delete({ userId, postId });
            await Post.update(
                { id: postId },
                {
                    points: postToUpvote.points - vote
                }
            );

            return true;
        }

        // User wants to change his vote.
        if (existingUpvoteByUser.value !== value) {
            await Upvote.update({ userId, postId }, { value });
            await Post.update(
                { id: postId },
                { points: postToUpvote.points + vote * 2 }
            );
            return true;
        }

        return true;
    }
}
