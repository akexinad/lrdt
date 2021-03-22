import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import { capitalize } from "lodash";
import React, { FC, useEffect } from "react";
import { PostSnippetFragment, useMeQuery } from "../generated/graphql";
import { UpvoteSection } from "./UpvoteSection";

type PostProps = {
    post: PostSnippetFragment;
};

export const Post: FC<PostProps> = ({ post }) => {
    const [{ data }] = useMeQuery();

    
    useEffect(() => {
        // if (!post.upvotes) return;
        if (!data) return;
        if (!data.me) return;

        // console.log(`post`, post)
        // console.log(`data`, data)
        
        // const upvoted = post.upvotes.find(upvote => upvote.userId === data?.me?.id)

        
    }, [post, data])


    return (
        <Flex
            key={post.id}
            p="5"
            shadow="md"
            borderWidth="1px"
            borderRadius="10px"
        >
            <UpvoteSection post={post} />
            <Box>
                <Heading fontSize="xl">{post.title}</Heading>
                <Box ml="auto">
                    by <strong>{capitalize(post.creator.username)}</strong>
                </Box>
                <Text mt="4">{post.textSnippet}</Text>
            </Box>
        </Flex>
    );
};
