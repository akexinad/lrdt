import {
    Box,
    Button,
    Flex,
    Heading,
    Link,
    Stack,
    Text
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { useMeQuery, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
    const [variables, setVariables] = useState<{limit: number, cursor: string | null}>({ limit: 10, cursor: null });

    const [{ data, fetching }] = usePostsQuery({
        variables
    });

    const [{ data: meData }] = useMeQuery();

    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        if (meData && meData.me) {
            setIsAuth(true);
        }
    }, [meData]);

    if (!fetching && !data) {
        return <Box color="red">Query Failed</Box>;
    }

    return (
        <>
            <Layout>
                <Flex justifyContent="space-between" align="center">
                    <Heading>lRdt</Heading>
                    {isAuth ? (
                        <Box>
                            <NextLink href="/create-post">
                                <Link>Create Post</Link>
                            </NextLink>
                        </Box>
                    ) : null}
                </Flex>
                <br />
                <br />
                <br />
                {!data && fetching ? (
                    <div>loading...</div>
                ) : (
                    <Stack spacing={8} mb="8">
                        {data!.posts.posts.map((post) => (
                            <Box
                                key={post.id}
                                p="5"
                                shadow="md"
                                borderWidth="1px"
                                borderRadius="10px"
                            >
                                <Heading fontSize="xl">{post.title}</Heading>
                                <Text mt="4">{post.textSnippet}</Text>
                            </Box>
                        ))}
                    </Stack>
                )}
                {data && data.posts.hasMore ? (
                    <Flex>
                        <Button
                            isLoading={fetching}
                            m="auto"
                            my="8"
                            colorScheme="green"
                            onClick={() => setVariables({
                                limit: variables.limit,
                                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt // the last item
                            })}
                        >
                            Load More
                        </Button>
                    </Flex>
                ) : null}
            </Layout>
        </>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
