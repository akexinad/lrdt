import { Stack } from "@chakra-ui/react";
import React, { FC } from "react";
import { PostsQuery } from "../generated/graphql";
import Post from "./Post";

type PostsProps = {
    data: PostsQuery;
};

export const Posts: FC<PostsProps> = ({ data }) => {
    return (
        <Stack spacing={8} mb="8">
            {/* 
                When we delete a post and invalidate the cache,
                the cache will return null for the deleted post.

                Thus we need to check for null.
             */}
            {data.posts.posts.map((post) =>
                !post ? null : <Post key={post.id} post={post} />
            )}
        </Stack>
    );
};
