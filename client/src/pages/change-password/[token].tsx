import { Box, Button, Link } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useRouter } from "next/router";
import React, { FC, useState } from "react";
import { InputOrTextArea } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";

/**
 * PLEASE NOTE:
 * 
 * The file name is important here as this tells Next.js what the 
 * name of the query parameter should be.
 */

const ChangePassword: FC = () => {
    const router = useRouter();

    const token = router.query.token;

    const [tokenError, setTokenError] = useState("");

    const [, changePassword] = useChangePasswordMutation();

    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ newPassword: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await changePassword({
                        newPassword: values.newPassword,
                        token: typeof token === "string" ? token : ""
                    });

                    if (!response.data) {
                        return router.push("/404/no_data");
                    }

                    if (response.data.changePassword.errors) {
                        const errorMap = toErrorMap(
                            response.data.changePassword.errors
                        );

                        if ("token" in errorMap) {
                            setTokenError(errorMap.token);
                        }

                        return setErrors(
                            toErrorMap(response.data.changePassword.errors)
                        );
                    }

                    router.push("/");
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <Box my="4">
                            <InputOrTextArea
                                name="newPassword"
                                placeholder="New Password"
                                label="New Password"
                                type="password"
                            />
                        </Box>
                        {tokenError ? (
                            <>
                                <Box color="red" textAlign="center">
                                    {tokenError}
                                </Box>
                                <Box mb="4" textAlign="center">
                                    <NextLink href="/forgot-password">
                                        <Link>Change password here</Link>
                                    </NextLink>
                                </Box>
                            </>
                        ) : null}
                        <Button
                            type="submit"
                            colorScheme="teal"
                            isLoading={isSubmitting}
                        >
                            Change Password
                        </Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
