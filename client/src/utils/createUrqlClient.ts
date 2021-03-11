import { dedupExchange, fetchExchange } from "@urql/core";
import { cacheExchange } from "@urql/exchange-graphcache";
import { SSRExchange } from "next-urql";
import {
    LoginMutation,
    LogoutMutation,
    MeDocument,
    MeQuery,
    RegisterMutation
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

export const createUrqlClient = (ssrExchange: SSRExchange) => ({
    url: "http://localhost:5000/graphql",
    fetchOptions: {
        credentials: "include" as const
    },
    exchanges: [
        dedupExchange,
        cacheExchange({
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
        ssrExchange,
        fetchExchange
    ]
});
