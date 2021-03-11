import { Cache, QueryInput } from "@urql/exchange-graphcache";

/**
 * This is just a helper function to make it easier to cast the types.
 */
export function betterUpdateQuery<Result, Query>(
    cache: Cache,
    qi: QueryInput,
    result: any,
    fn: (res: Result, qry: Query) => Query
) {
    return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}
