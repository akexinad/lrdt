import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { FC, useState } from "react";
import { InputOrTextArea } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import { useUpdatePostMutation } from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetPostFromUrl } from "../../../utils/useGetPostFromUrl";

const EditPost: FC = () => {
    const router = useRouter();
    const [error, setError] = useState("");

    const [, updatePost] = useUpdatePostMutation();
    const { postQuery, postId } = useGetPostFromUrl();

    const [{ fetching, data }] = postQuery;

    if (fetching) {
        return <Box textAlign="center">...Loading</Box>;
    }

    if (!data || !data.post) {
        return (
            <Layout>
                <Box>404: Post not found.</Box>
            </Layout>
        );
    }
    
    return (
        <Layout variant="small">
            <Formik
                initialValues={{ title: data.post.title, text: data.post.text }}
                onSubmit={async (values) => {
                    const response = await updatePost({
                        id: postId,
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
                            Update Post
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(EditPost);
