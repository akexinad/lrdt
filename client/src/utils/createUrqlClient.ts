import { dedupExchange, fetchExchange, stringifyVariables } from "@urql/core";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import gql from "graphql-tag";
import { NextUrqlContext, SSRExchange } from "next-urql";
import {
    LoginMutation,
    LogoutMutation,
    MeDocument,
    MeQuery,
    PostSnippetFragment,
    RegisterMutation,
    VoteMutationVariables
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { invalidateCache } from "./invalidateCache";
import { isServer } from "./isServer";

/*
A way of handling authentication errors globally

export const errorExchange: Exchange = ({ forward }) => (ops$) => {
    return pipe(
        forward(ops$),
            tap(({ error }) => {
                if (error?.message.includes("not authenticated")) {
                    Router.replace("/login");
                }
            })
        );
    };
*/

export const createUrqlClient = (
    ssrExchange: SSRExchange,
    ctx?: NextUrqlContext
) => {
    return {
        url: "http://localhost:5000/graphql",
        fetchOptions: {
            credentials: "include" as const,
            /**
             * this is in reference to the next.js server, not the
             * node.js back end server.
             */
            headers: isServer()
                ? { cookie: ctx?.req.headers.cookie }
                : undefined
        },
        exchanges: [
            dedupExchange,
            cacheExchange({
                keys: {
                    PaginatedPosts: () => null
                },
                resolvers: {
                    Query: {
                        posts: cursorPagination()
                    }
                },
                updates: {
                    Mutation: {
                        vote: (_result, args, cache, _info) => {
                            const {
                                postId,
                                value
                            } = args as VoteMutationVariables;

                            const postToUpdate = cache.readFragment(
                                gql`
                                    fragment _ on Post {
                                        id
                                        points
                                        voteStatus
                                    }
                                `,
                                { id: postId }
                            ) as PostSnippetFragment;

                            if (!postToUpdate) {
                                return console.error("post not found");
                            }

                            const { voteStatus } = postToUpdate;

                            const newVoteStatus =
                                value === voteStatus ? null : value;

                            let updatedPoints = postToUpdate.points;

                            /**
                             * Change the vote
                             */
                            if (voteStatus && voteStatus !== value) {
                                updatedPoints += value * 2;
                            }

                            /**
                             * new vote.
                             */
                            if (voteStatus === null) {
                                updatedPoints += value;
                            }

                            /**
                             * Remove existing vote
                             */
                            if (voteStatus === value) {
                                updatedPoints -= value;
                            }

                            cache.writeFragment(
                                gql`
                                    fragment __ on Post {
                                        points
                                        voteStatus
                                    }
                                `,
                                {
                                    id: postId,
                                    points: updatedPoints,
                                    voteStatus: newVoteStatus
                                }
                            );
                        },
                        createPost: (_result, _args, cache, _info) => {
                            invalidateCache(cache, "Query", "posts");
                        },
                        login: (result, _, cache, __) => {
                            betterUpdateQuery<LoginMutation, MeQuery>(
                                cache,
                                { query: MeDocument },
                                result,
                                (_result, query) => {
                                    if (_result.login.errors) {
                                        return query;
                                    } else {
                                        return {
                                            me: _result.login.user
                                        };
                                    }
                                }
                            );

                            invalidateCache(cache, "Query", "posts");
                        },
                        register: (result, _, cache, __) => {
                            betterUpdateQuery<RegisterMutation, MeQuery>(
                                cache,
                                { query: MeDocument },
                                result,
                                (_result, query) => {
                                    if (_result.register.errors) {
                                        return query;
                                    } else {
                                        return {
                                            me: _result.register.user
                                        };
                                    }
                                }
                            );
                        },
                        logout: (result, _, cache, __) => {
                            betterUpdateQuery<LogoutMutation, MeQuery>(
                                cache,
                                { query: MeDocument },
                                result,
                                () => {
                                    return {
                                        me: null
                                    };
                                }
                            );

                            invalidateCache(cache, "Query", "posts");
                        }
                    }
                }
            }),
            // errorExchange,
            ssrExchange,
            fetchExchange
        ]
    };
};

export const cursorPagination = (): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info;

        const allFields = cache.inspectFields(entityKey);

        const fieldInfos = allFields.filter(
            (info) => info.fieldName === fieldName
        );

        const size = fieldInfos.length;

        if (size === 0) {
            return undefined;
        }

        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;

        const paginatedPosts = cache.resolve(entityKey, fieldKey) as string;
        // we need to resolve for posts within paginatedPosts
        const postsInTheCache = cache.resolve(paginatedPosts, "posts");

        info.partial = !postsInTheCache;

        const results: string[] = [];
        let hasMore = true;

        fieldInfos.forEach((fieldInfo) => {
            const key = cache.resolve(entityKey, fieldInfo.fieldKey) as string;
            const posts = cache.resolve(key, "posts") as string[];
            const _hasMore = cache.resolve(key, "hasMore") as boolean;

            hasMore = _hasMore;

            results.push(...posts);
        });

        return {
            __typename: "PaginatedPosts",
            hasMore,
            posts: results
        };

        /*
        const visited = new Set();
        let result: NullArray<string> = [];
        let prevOffset: number | null = null;

        for (let i = 0; i < size; i++) {
            const { fieldKey, arguments: args } = fieldInfos[i];
            if (args === null || !compareArgs(fieldArgs, args)) {
                continue;
            }

            const links = cache.resolve(entityKey, fieldKey) as string[];
            const currentOffset = args;

            if (
                links === null ||
                links.length === 0 ||
                typeof currentOffset !== "number"
            ) {
                continue;
            }

            const tempResult: NullArray<string> = [];

            for (let j = 0; j < links.length; j++) {
                const link = links[j];
                if (visited.has(link)) continue;
                tempResult.push(link);
                visited.add(link);
            }

            if (
                (!prevOffset || currentOffset > prevOffset) ===
                (mergeMode === "after")
            ) {
                result = [...result, ...tempResult];
            } else {
                result = [...tempResult, ...result];
            }

            prevOffset = currentOffset;
        }

        const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
        if (hasCurrentPage) {
            return result;
        } else if (!(info as any).store.schema) {
            return undefined;
        } else {
            info.partial = true;
            return result;
        }
        */
    };
};
