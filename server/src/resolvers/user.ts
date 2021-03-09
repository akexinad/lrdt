import argon2 from "argon2";
import { MyContext } from "src/types";
import {
    Arg,
    Ctx,
    Field,
    InputType,
    Mutation,
    ObjectType,
    Query,
    Resolver
} from "type-graphql";
import { User } from "../entites/User";

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string;
    @Field()
    password: string;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User;
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(@Ctx() ctx: MyContext): Promise<User | null> {
        const userId = ctx.req.session.userId;

        if (!userId) return null;

        const user = await ctx.em.findOne(User, { id: userId });

        return user;
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() ctx: MyContext
    ): Promise<UserResponse> {
        const userExists = await ctx.em.findOne(User, {
            username: options.username.toLowerCase()
        });

        if (userExists) {
            return {
                errors: [
                    {
                        field: "Username",
                        message: "Username already taken"
                    }
                ]
            };
        }

        if (options.username.length < 6) {
            return {
                errors: [
                    {
                        field: "Username",
                        message: "Username must be at least six characters"
                    }
                ]
            };
        }

        if (options.password.length < 6) {
            return {
                errors: [
                    {
                        field: "Password",
                        message: "Password must be at least six characters"
                    }
                ]
            };
        }

        const hashedPass = await argon2.hash(options.password);

        const user = ctx.em.create(User, {
            username: options.username.toLowerCase(),
            password: hashedPass
        });

        await ctx.em.persistAndFlush(user);

        // auto login after register
        ctx.req.session.userId = user.id;

        return {
            user
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("options") options: UsernamePasswordInput,
        @Ctx() ctx: MyContext
    ): Promise<UserResponse> {
        const userExists = await ctx.em.findOne(User, {
            username: options.username.toLowerCase()
        });

        if (!userExists) {
            return {
                errors: [
                    {
                        field: "Username",
                        message: "Invalid login"
                    }
                ]
            };
        }

        const valid = await argon2.verify(
            userExists.password,
            options.password
        );

        if (!valid) {
            return {
                errors: [
                    {
                        field: "Password",
                        message: "Invalid login"
                    }
                ]
            };
        }

        ctx.req.session.userId = userExists.id;

        return {
            user: userExists
        };
    }
}
