import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React, { FC } from "react";
import Router from "next/link";
import { useMeQuery } from "../generated/graphql";

type NavBarProps = {};

export const NavBar: FC<NavBarProps> = () => {
    const [{ data, fetching }] = useMeQuery();

    let body = null;

    if (fetching) {
        // data is loading
        return body;
    } else if (!data?.me) {
        // user is not logged in
        body = (
            <>
                <Router href="/login">
                    <Link color="white" mr="2">
                        login
                    </Link>
                </Router>
                <Router href="/register">
                    <Link color="white">register</Link>
                </Router>
            </>
        );
    } else {
        // user is logged in
        body = (
            <Flex>
                {/* <Box>{data?.me?.username}</Box> */}
                {data?.me?.username}
                <Button ml="4" colorScheme="blue">
                    logout
                </Button>
            </Flex>
        );
    }

    return (
        <Flex bg={"tomato"} p="4">
            <Box ml="auto">{body}</Box>
        </Flex>
    );
};
