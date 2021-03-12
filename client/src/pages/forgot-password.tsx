import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import React, { FC, useState } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

type ForgotPasswordProps = {};

const ForgotPassword: FC<ForgotPasswordProps> = () => {
    const [complete, setComplete] = useState(false);

    const [, forgotPassword] = useForgotPasswordMutation();

    return complete ? (
        <Box textAlign="center" mt="10" maxWidth="300" mx="auto">
            If an account with that email exists, we sent you an email with a
            link to change your password.
        </Box>
    ) : (
        <Wrapper variant="small">
            <Formik
                initialValues={{ email: "" }}
                onSubmit={async (values) => {
                    await forgotPassword(values);
                    setComplete(true);
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Box mb="4">
                            <InputField
                                name="email"
                                placeholder="Email"
                                label="Email"
                            />
                        </Box>

                        <Button
                            type="submit"
                            colorScheme="teal"
                            isLoading={isSubmitting}
                        >
                            Forgot Password
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
