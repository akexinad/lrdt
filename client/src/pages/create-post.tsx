import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { FC, useEffect, useState } from "react";
import { InputOrTextArea } from "../components/InputField";
import { Layout } from "../components/Layout";
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

type CreatePostProps = {};

const CreatePost: FC<CreatePostProps> = () => {
    const router = useRouter();

    const [error, setError] = useState("");

    const [, createPost] = useCreatePostMutation();

    /**
     * We can use this hook but it's a nice experience if the user
     * sees a loading page if he is not authenticated.
     */
    // useIsAuth();

    const [{ data, fetching }] = useMeQuery();

    useEffect(() => {
        if (!fetching && !data?.me) {
            // we are telling the router where to go after the user has logged in.
            router.replace("/login?next=" + router.pathname);
        }
    }, [fetching, data, router]);

    return (
        <Layout variant="small">
            {!fetching && !data?.me ? (
                <Box textAlign="center">...Loading</Box>
            ) : (
                <Formik
                    initialValues={{ title: "", text: "" }}
                    onSubmit={async (values) => {
                        const response = await createPost({
                            options: { ...values }
                        });

                        if (response.error) {
                            setError(response.error.response.statusText);
                        }

                        router.push("/");
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <InputOrTextArea
                                name="title"
                                placeholder="Title"
                                label="Title"
                            />
                            <Box my="4">
                                <InputOrTextArea
                                    name="text"
                                    placeholder="Text..."
                                    label="Text"
                                    textarea
                                />
                            </Box>

                            {error ? (
                                <>
                                    <Box color="red" textAlign="center">
                                        {error}
                                    </Box>
                                </>
                            ) : null}

                            <Button
                                type="submit"
                                colorScheme="teal"
                                isLoading={isSubmitting}
                            >
                                Create Post
                            </Button>
                        </Form>
                    )}
                </Formik>
            )}
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
