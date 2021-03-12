import argon2 from "argon2";
import { MyContext } from "../types";
import { sendEmail } from "../utils/sendEmail";
import {
    Arg,
    Ctx,
    Field,
    Mutation,
    ObjectType,
    Query,
    Resolver
} from "type-graphql";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { User } from "../entites/User";
import { validateRegister } from "../utils/validateRegister";
import { UsernamePasswordEmailInput } from "./usernamePasswordEmailInput";

import { v4 } from "uuid";

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
    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string,
        @Ctx() ctx: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length < 6) {
            return {
                errors: [
                    {
                        field: "newPassword",
                        message: "Password must be at least six characters"
                    }
                ]
            };
        }

        const key = FORGET_PASSWORD_PREFIX + token;

        const userId = await ctx.redis.get(key);

        if (!userId) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "Token Expired"
                    }
                ]
            };
        }

        const userWithNewPassword = await ctx.em.findOne(User, { id: +userId });

        if (!userWithNewPassword) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "User no longer exists"
                    }
                ]
            };
        }

        userWithNewPassword.password = await argon2.hash(newPassword);

        await ctx.em.persistAndFlush(userWithNewPassword);

        // disable change password once password was changed successfully.
        ctx.redis.del(key);

        ctx.req.session.userId = userWithNewPassword.id;

        return {
            user: userWithNewPassword
        };
    }

    // FORGOT PASSWORD MUTATION
    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() ctx: MyContext
    ): Promise<boolean> {
        const user = await ctx.em.findOne(User, { email });

        if (!user) {
            /**
             * For security reasons, it's a good idea to return true
             * to deter malicious fishing through your users for a
             * vulnerable email.
             */
            return true;
        }

        const token = v4();

        await ctx.redis.set(
            FORGET_PASSWORD_PREFIX + token,
            user.id,
            "ex",
            // 3 days
            1000 * 60 * 60 * 24 * 3
        );

        await sendEmail(
            email,
            `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`
        );

        return true;
    }

    // ME QUERY
    @Query(() => User, { nullable: true })
    async me(@Ctx() ctx: MyContext): Promise<User | null> {
        const userId = ctx.req.session.userId;

        if (!userId) return null;

        const user = await ctx.em.findOne(User, { id: userId });

        return user;
    }

    // REGISTER MUTATION
    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: UsernamePasswordEmailInput,
        @Ctx() ctx: MyContext
    ): Promise<UserResponse> {
        const userNameExists = await ctx.em.findOne(User, {
            username: options.username.toLowerCase()
        });

        if (userNameExists) {
            return {
                errors: [
                    {
                        field: "username",
                        message: "Username already taken"
                    }
                ]
            };
        }

        const emailAlreadyInUse = await ctx.em.findOne(User, {
            email: options.email.toLowerCase()
        });

        if (emailAlreadyInUse) {
            return {
                errors: [
                    {
                        field: "email",
                        message: "Email already in use"
                    }
                ]
            };
        }

        const validationErrors = validateRegister(options);

        if (validationErrors) {
            return {
                errors: validationErrors
            };
        }

        const hashedPass = await argon2.hash(options.password);

        const user = ctx.em.create(User, {
            username: options.username.toLowerCase(),
            email: options.email,
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
        @Arg("userNameOrEmail") userNameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() ctx: MyContext
    ): Promise<UserResponse> {
        // just a quick and dirty validation to check if user passes username or email.
        const userExists = await ctx.em.findOne(
            User,
            userNameOrEmail.includes("@")
                ? { email: userNameOrEmail }
                : { username: userNameOrEmail }
        );

        if (!userExists) {
            return {
                errors: [
                    {
                        field: "userNameOrEmail",
                        message: "Invalid login"
                    }
                ]
            };
        }

        const valid = await argon2.verify(userExists.password, password);

        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
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

    @Mutation(() => Boolean)
    logout(@Ctx() ctx: MyContext): Promise<boolean> {
        return new Promise((res) =>
            ctx.req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                    return res(false);
                }

                ctx.res.clearCookie(COOKIE_NAME);
                res(true);
            })
        );
    }
}
