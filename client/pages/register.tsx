import { Box, Button, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React, { FC } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { initialFormValues } from "../utils/formUtils";

type RegisterProps = {};

const Register: FC<RegisterProps> = () => {
    return (
        <Wrapper variant="small">
            <Formik
                initialValues={initialFormValues}
                onSubmit={(values) => console.log(values)}
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
