import { Field, InputType } from "type-graphql";

@InputType()
export class UsernamePasswordEmailInput {
    @Field()
    username: string;

    @Field()
    email: string;

    @Field()
    password: string;
}

@InputType()
export class UpdatePostInput {
    @Field()
    title: string;

    @Field()
    text: string;
}

@InputType()
export class CreatePostOptions {
    @Field()
    title: string;

    @Field()
    text: string;
}
