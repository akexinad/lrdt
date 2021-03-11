import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React, { FC } from "react";
import Router from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";

type NavBarProps = {};

export const NavBar: FC<NavBarProps> = () => {
    const [{ data, fetching }] = useMeQuery();
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

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
            <Flex alignItems="center">
                <Box>{data?.me?.username}</Box>
                <Button
                    isLoading={logoutFetching}
                    onClick={() => logout()}
                    ml="4"
                    colorScheme="blue"
                >
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
