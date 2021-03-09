import argon2 from "argon2";
import { MyContext } from "src/types";
import {
    Arg,
    Ctx,
    Field,
    InputType,
    Mutation,
    ObjectType,
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

        return {
            user: userExists
        };
    }
}
