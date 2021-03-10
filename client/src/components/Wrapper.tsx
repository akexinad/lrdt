import { Box } from "@chakra-ui/react";
import React, { FC } from "react";

type WrapperProps = {
    variant?: "small" | "regular";
};

export const Wrapper: FC<WrapperProps> = (props) => {
    const { children, variant = "regular" } = props;

    return (
        <Box maxW={variant === "regular" ? "800px" : "400px"} mt="8" mx="auto">
            {children}
        </Box>
    );
};
