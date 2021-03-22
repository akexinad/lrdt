import argon2 from "argon2";
import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    Root
} from "type-graphql";
import { getConnection, InsertResult } from "typeorm";
import { v4 } from "uuid";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";
import { User } from "../entites/User";
import { MyContext } from "../types/types";
import { sendEmail } from "../utils/sendEmail";
import { validateRegister } from "../utils/validateRegister";
import { UsernamePasswordEmailInput } from "./usernamePasswordEmailInput";

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

@Resolver(User)
export class UserResolver {
    /**
     * Logged in users should not be able to see other people's emails.
     *
     * The name of the field resolver needs to match the entity's property.
     */
    @FieldResolver(() => String)
    email(@Root() user: User, @Ctx() ctx: MyContext) {
        if (ctx.req.session.userId === user.id) {
            return user.email;
        }

        return "";
    }

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

        const userWithNewPassword = await User.findOne(+userId);

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

        const newHashedPassword = await argon2.hash(newPassword);

        User.update({ id: +userId }, { password: newHashedPassword });

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
        const user = await User.findOne({
            where: {
                email
            }
        });

        if (!user) {
            /**
             * For security reasons, it's a good idea to return true
             * to deter malicious users fishing through your list of
             * users for a vulnerable email.
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
            `<a href="http://localhost:3001/change-password/${token}">Reset Password</a>`
        );

        return true;
    }

    // ME QUERY
    @Query(() => User, { nullable: true })
    async me(@Ctx() ctx: MyContext): Promise<User | undefined> {
        const userId = ctx.req.session.userId;

        if (!userId) return undefined;

        return getConnection()
            .getRepository(User)
            .createQueryBuilder("user")
            .innerJoinAndSelect("user.posts", "post")
            .where("user.id = :id", { id: ctx.req.session.userId })
            .getOne();

        // return User.findOne(userId);
    }

    // REGISTER MUTATION
    @Mutation(() => UserResponse)
    async register(
        @Arg("options") options: UsernamePasswordEmailInput,
        @Ctx() ctx: MyContext
    ): Promise<UserResponse> {
        const userNameExists = await User.findOne({
            where: {
                username: options.username.toLowerCase()
            }
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

        const emailAlreadyInUse = await User.findOne({
            where: {
                email: options.email.toLowerCase()
            }
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

        const result: InsertResult = await getConnection()
            .createQueryBuilder()
            .insert()
            .into(User)
            .values({
                username: options.username,
                email: options.email,
                password: hashedPass
            })
            .returning("*")
            .execute();

        const user: User = result.raw[0];

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
        const userExists = await User.findOne(
            userNameOrEmail.includes("@")
                ? { where: { email: userNameOrEmail } }
                : { where: { username: userNameOrEmail } }
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

    @Query(() => [User])
    async users(): Promise<User[]> {
        const users = await User.find();

        return users;
    }
}
