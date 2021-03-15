import { dedupExchange, fetchExchange, stringifyVariables } from "@urql/core";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import { SSRExchange } from "next-urql";
import {
    LoginMutation,
    LogoutMutation,
    MeDocument,
    MeQuery,
    RegisterMutation
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

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
