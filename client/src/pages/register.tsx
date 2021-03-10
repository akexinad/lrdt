import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { FC } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useRegisterMutation } from "../generated/graphql";
import { initialFormValues } from "../utils/formUtils";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";

type RegisterProps = {};

const Register: FC<RegisterProps> = () => {
    const router = useRouter();

    const [, register] = useRegisterMutation();

    return (
        <Wrapper variant="small">
            <Formik
                initialValues={initialFormValues}
                onSubmit={async (values, { setErrors }) => {
                    const response = await register(values);

                    if (response.data.register.errors) {
                        return setErrors(
                            toErrorMap(response.data.register.errors)
                        );
                    }

                    router.push("/");
                }}
            >
                {({ values, handleChange, isSubmitting }) => (
                    <Form>
                        <InputField
                            name="username"
                            placeholder="Username"
                            label="Username"
                        />
                        <Box my="4">
                            <InputField
                                name="password"
                                placeholder="Password"
                                label="Password"
                                type="password"
                            />
                        </Box>
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

export default Register;
