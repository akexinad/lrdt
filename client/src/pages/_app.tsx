import { ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import { Cache, cacheExchange, QueryInput } from "@urql/exchange-graphcache";
import { createClient, dedupExchange, fetchExchange, Provider } from "urql";
import theme from "../../theme";
import { LoginMutation, MeDocument, MeQuery, RegisterMutation } from "../generated/graphql";

/**
 * This is just a helper function to make it easier to cast the types.
 */

function betterUpdateQuery<Result, Query>(
    cache: Cache,
    qi: QueryInput,
    result: any,
    fn: (res: Result, qry: Query) => Query
) {
    return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

const client = createClient({
    url: "http://localhost:5000/graphql",
    fetchOptions: {
        credentials: "include"
    },
    exchanges: [
        dedupExchange,
        cacheExchange({
            updates: {
                Mutation: {
                    login: (_result, _, cache, __) => {
                        betterUpdateQuery<LoginMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            _result,
                            (result, query) => {
                                if (result.login.errors) {
                                    return query;
                                } else {
                                    return {
                                        me: result.login.user
                                    };
                                }
                            }
                        );
                    },
                    register: (_result, _, cache, __) => {
                        betterUpdateQuery<RegisterMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            _result,
                            (result, query) => {
                                if (result.register.errors) {
                                    return query;
                                } else {
                                    return {
                                        me: result.register.user
                                    };
                                }
                            }
                        );
                    }
                }
            }
        }),
        fetchExchange
    ]
});

function MyApp({ Component, pageProps }: any) {
    return (
        <Provider value={client}>
            <ChakraProvider resetCSS theme={theme}>
                <ColorModeProvider
                    options={{
                        useSystemColorMode: true
                    }}
                >
                    <Component {...pageProps} />
                </ColorModeProvider>
            </ChakraProvider>
        </Provider>
    );
}

export default MyApp;