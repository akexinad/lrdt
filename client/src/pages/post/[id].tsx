import { Box, Heading, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React, { FC } from "react";
import { Layout } from "../../components/Layout";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

type PostProps = {};

const Post: FC<PostProps> = () => {
    const { postQuery } = useGetPostFromUrl();
    const [{ fetching, data }] = postQuery;

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
