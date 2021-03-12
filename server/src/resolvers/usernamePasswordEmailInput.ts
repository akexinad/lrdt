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
