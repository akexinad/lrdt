import { Box, Button, Flex, Link, PositionProps } from "@chakra-ui/react";
import Router from "next/link";
import React, { FC } from "react";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

type NavBarProps = {};

export const NavBar: FC<NavBarProps> = () => {
    const [{ data, fetching }] = useMeQuery({
        /**
         * Do not run this query on the server.
         */
        pause: isServer()
    });
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

    const fixNavBar: PositionProps = {
        position: "sticky",
        top: "0",
        zIndex: "10"
    };

    return (
        <Flex {...fixNavBar} bg={"tomato"} p="4">
            <Box ml="auto">{body}</Box>
        </Flex>
    );
};
