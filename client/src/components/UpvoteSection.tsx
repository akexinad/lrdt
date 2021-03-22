import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import React, { FC, useState } from "react";
import {
    PostSnippetFragment,
    useMeQuery,
    useVoteMutation
} from "../generated/graphql";
import Router from "next/router";

type UpvoteSectionProps = {
    post: PostSnippetFragment;
};

type VoteType = "upvoteLoading" | "downVoteLoading" | "notLoading";

export const UpvoteSection: FC<UpvoteSectionProps> = ({ post }) => {
    const [{ data }] = useMeQuery();
    const [loading, setLoading] = useState<VoteType>("notLoading");
    const [, vote] = useVoteMutation();

    const votePost = async (value: number, postId: number, type: VoteType) => {
        if (!data) return;

        if (!data.me) {
            Router.push("/login")
            return;
        }
        
        setLoading(type);
        await vote({
            value,
            postId
        });
        setLoading("notLoading");
    };

    return (
        <Flex
            mr="4"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
        >
            <IconButton
                bg={post.voteStatus === 1 ? "tomato" : "lightgray"}
                _hover={{
                    bg: "lightblue",
                    transition: "0.2s"
                }}
                aria-label="upvote post"
                icon={
                    <ChevronUpIcon
                        w="5"
                        h="5"
                    />
                }
                onClick={() => votePost(1, post.id, "upvoteLoading")}
                isLoading={loading === "upvoteLoading"}
            />
            <Text my="3">
                <strong>{post.points}</strong>
            </Text>
            <IconButton
                bg={post.voteStatus === -1 ? "tomato" : "lightgray"}
                _hover={{
                    bg: "lightblue",
                    transition: "0.2s"
                }}
                aria-label="downvote post"
                icon={
                    <ChevronDownIcon
                        w="5"
                        h="5"
                    />
                }
                onClick={() => votePost(-1, post.id, "downVoteLoading")}
                isLoading={loading === "downVoteLoading"}
            />
        </Flex>
    );
};
