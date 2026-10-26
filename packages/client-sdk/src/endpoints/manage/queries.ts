import { getManageGetPoliciesSuspenseQueryOptions } from "#/endpoints/_internal/generated/manage"

/**
 * The query options used by `usePoliciesSuspense`, for prefetching the policies into the
 * same cache entry, e.g. from a route loader.
 */
export const policiesQueryOptions = () => getManageGetPoliciesSuspenseQueryOptions()
