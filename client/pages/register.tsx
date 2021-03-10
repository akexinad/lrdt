import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { FC } from "react";
import { useMutation } from "urql";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { initialFormValues } from "../utils/formUtils";

type RegisterProps = {};

const Register: FC<RegisterProps> = () => {
    const [{}, register] = useMutation(`
    mutation Register($username: String!, $password: String!) {
        register(options: { username: $username, password: $password }) {
          user {
            id
            username
          }
          errors {
            field
            message
          }
        }
      }
      `);

    return (
        <Wrapper variant="small">
            <Formik
                initialValues={initialFormValues}
                onSubmit={async (values) => {
                    const response = await register(values);
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
