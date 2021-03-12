import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import router from "next/router";
import React, { FC } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useLoginMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { initialFormValues } from "../utils/formUtils";
import { toErrorMap } from "../utils/toErrorMap";

import NextLink from "next/link";

type LoginProps = {};

const Login: FC<LoginProps> = () => {
    const [, login] = useLoginMutation();

    return (
        <Wrapper variant="small">
            <Formik
                initialValues={initialFormValues}
                onSubmit={async (values, { setErrors }) => {
                    const response = await login(values);

                    if (!response.data) {
                        return router.push("/404/no_data");
                    }

                    if (response.data.login.errors) {
                        return setErrors(
                            toErrorMap(response.data.login.errors)
                        );
                    }

                    router.push("/");
                }}
            >
                {({ values, handleChange, isSubmitting }) => (
                    <Form>
                        <InputField
                            name="userNameOrEmail"
                            placeholder="Username or Email"
                            label="Username or Email"
                        />
                        <Box my="4">
                            <InputField
                                name="password"
                                placeholder="Password"
                                label="Password"
                                type="password"
                            />
                        </Box>
                        <Flex mb="4" textAlign="center">
                            <NextLink href="/forgot-password">
                                <Link ml="auto">Forgot Password?</Link>
                            </NextLink>
                        </Flex>

                        <Button
                            type="submit"
                            colorScheme="teal"
                            isLoading={isSubmitting}
                        >
                            Submit
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(Login);
