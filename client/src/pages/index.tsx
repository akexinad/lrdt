import { Link } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import { NavBar } from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";

const Index = () => {
    const [{ data }] = usePostsQuery();
    return (
        <>
            <NavBar />
            <NextLink href="/create-post">
                <Link>CreatePost</Link>
            </NextLink>
            <br />
            {!data ? (
                <div>loading...</div>
            ) : (
                data.posts.map((post) => <div key={post.id}>{post.title}</div>)
            )}
        </>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
