import { Box, Heading, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { FC } from "react";
import { Layout } from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";

type PostProps = {};

const Post: FC<PostProps> = () => {
    const router = useRouter();

    const postId =
        typeof router.query.id === "string" ? parseInt(router.query.id) : -1;

    const [{ data, fetching }] = usePostQuery({
        pause: postId === -1,

        variables: {
            id: postId
        }
    });

    return (
        <Layout>
            {fetching ? (
                <Box>...Loading...</Box>
            ) : data && data.post ? (
                <Box textAlign="center">
                    <Heading mb="8" textDecoration="underline">
                        {data.post.title}
                    </Heading>
                    <Text>{data.post.text}</Text>
                </Box>
            ) : (
                <Box>Post not found</Box>
            )}
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
