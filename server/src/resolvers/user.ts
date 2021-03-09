import argon2 from "argon2";
import { User } from "../entites/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, Resolver } from "type-graphql";

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string;
    @Field()
    password: string;
}

@Resolver()
export class UserResolver {
    @Mutation(() => User)
    async register(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() ctx: MyContext
    ): Promise<User> {
        const hashedPass = await argon2.hash(options.password);

        const user = ctx.em.create(User, {
            username: options.username,
            password: hashedPass
        });

        await ctx.em.persistAndFlush(user);

        return user;
    }
}
