import React, { FC } from "react";
import { WrapperVariant } from "../types";
import { NavBar } from "./NavBar";
import { Wrapper } from "./Wrapper";

type LayoutProps = {
    variant?: WrapperVariant;
};

export const Layout: FC<LayoutProps> = ({ children, variant }) => {
    return (
        <>
            <NavBar></NavBar>
            <Wrapper variant={variant}>{children}</Wrapper>
        </>
    );
};
