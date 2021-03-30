import { Box, Button, Flex, Icon, Link, PositionProps } from "@chakra-ui/react";
import Router from "next/link";
import React, { FC } from "react";
import { MdHome } from "react-icons/md";
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

    const fixNavBar: PositionProps = {
        position: "sticky",
        top: "0",
        zIndex: "10"
    };

    return (
        <Flex alignItems="center" {...fixNavBar} bg={"tomato"} p="4">
            <Box>
                <Router href="/">
                    <Link>
                        <Icon
                            // as={HomeIcon}
                            as={MdHome}
                            h="8"
                            w="8"
                            _hover={{ color: "yellow", transition: "0.2s" }}
                        />
                    </Link>
                </Router>
            </Box>
            <Box ml="auto">{body}</Box>
        </Flex>
    );
};
