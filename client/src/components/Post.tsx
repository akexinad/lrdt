import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, IconButton, Link, Text } from "@chakra-ui/react";
import { capitalize } from "lodash";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { FC } from "react";
import {
    PostSnippetFragment,
    useDeletePostMutation,
    useMeQuery
} from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { UpvoteSection } from "./UpvoteSection";

type PostProps = {
    post: PostSnippetFragment;
};

const Post: FC<PostProps> = ({ post }) => {
    const router = useRouter();

    const [{ data }] = useMeQuery();

    const [, deletePost] = useDeletePostMutation();

    return (
        <Flex
            key={post.id}
            p="5"
            shadow="md"
            borderWidth="1px"
            borderRadius="10px"
        >
            <UpvoteSection post={post} />
            <Box flex="1">
                <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                    <Link>
                        <Heading fontSize="xl">{post.title}</Heading>
                    </Link>
                </NextLink>
                <Box ml="auto">
                    by <strong>{capitalize(post.creator.username)}</strong>
                </Box>
                <Flex justifyContent="space-between">
                    <Text mt="4">{post.textSnippet}</Text>

                    {data && data.me && data.me.id === post.creatorId ? (
                        <Flex>
                            <NextLink
                                href={"/post/edit/[id]"}
                                as={`/post/edit/${post.id}`}
                            >
                                <IconButton
                                    icon={
                                        <EditIcon
                                            _hover={{
                                                color: "lightgreen",
                                                transition: "0.2s"
                                            }}
                                            h="6"
                                            w="6"
                                        />
                                    }
                                    aria-label="delete post"
                                    onClick={() =>
                                        router.push(`/post/edit/${post.id}`)
                                    }
                                />
                            </NextLink>
                            <IconButton
                                icon={
                                    <DeleteIcon
                                        _hover={{
                                            color: "tomato",
                                            transition: "0.2s"
                                        }}
                                        h="6"
                                        w="6"
                                    />
                                }
                                aria-label="delete post"
                                onClick={() => deletePost({ id: post.id })}
                            />
                        </Flex>
                    ) : null}
                </Flex>
            </Box>
        </Flex>
    );
};

export default withUrqlClient(createUrqlClient)(Post);
