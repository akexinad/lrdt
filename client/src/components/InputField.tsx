import {
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input,
    Textarea
} from "@chakra-ui/react";
import { useField } from "formik";
import React, { FC, InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    name: string;
    label: string;
    placeholder: string;
    type?: string;
    textarea?: boolean;
};

export const InputOrTextArea: FC<InputFieldProps> = (props) => {
    const { textarea = false } = props;
    const [field, { error }] = useField(props);

    return (
        <FormControl isInvalid={!!error}>
            <FormLabel htmlFor={field.name}>{props.label}</FormLabel>
            {textarea ? (
                <Textarea
                    {...field}
                    id={field.name}
                    placeholder={props.placeholder}
                    type={props.type}
                />
            ) : (
                <Input
                    {...field}
                    id={field.name}
                    placeholder={props.placeholder}
                    type={props.type}
                />
            )}
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    );
};
