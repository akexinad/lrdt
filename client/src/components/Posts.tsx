import { Stack } from "@chakra-ui/react";
import React, { FC } from "react";
import { PostsQuery } from "../generated/graphql";
import { Post } from "./Post";

type PostsProps = {
    data: PostsQuery;
};

export const Posts: FC<PostsProps> = ({ data }) => {
    return (
        <Stack spacing={8} mb="8">
            {data.posts.posts.map((post) => (
                <Post key={post.id} post={post} />
            ))}
        </Stack>
    );
};
