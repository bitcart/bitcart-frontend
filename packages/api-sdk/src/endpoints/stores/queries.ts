import { getStoresGetItemSuspenseQueryOptions } from "../_internal/generated/stores"

/**
 * The query options used by `useStoreSuspense`, for prefetching a store into the same cache
 * entry, e.g. from a route loader.
 */
export const storeQueryOptions = (storeId: string) => getStoresGetItemSuspenseQueryOptions(storeId)
