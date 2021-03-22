import { Cache } from "@urql/exchange-graphcache";

export const invalidateCache = (
    cache: Cache,
    entity: string,
    field: string
): void => {
    const allFields = cache.inspectFields(entity);

    const fieldInfos = allFields.filter((info) => info.fieldName === field);

    fieldInfos.forEach((fieldInfo) =>
        cache.invalidate(entity, field, fieldInfo.arguments || {})
    );

    cache.invalidate(entity, field, {
        limit: 15
    });
};
