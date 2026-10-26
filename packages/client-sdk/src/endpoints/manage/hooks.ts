import {
  useManageGetPolicies,
  useManageGetPoliciesSuspense,
} from "#/endpoints/_internal/generated/manage"

import type { Policies } from "./types"

// TODO: Convert to a direct binding once Orval types an `anyOf` response with output types.
export const usePolicies = <TData = Policies>(
  ...params: Parameters<typeof useManageGetPolicies<TData>>
) => useManageGetPolicies<TData>(...params)

// TODO: Convert to a direct binding once Orval types an `anyOf` response with output types.
export const usePoliciesSuspense = <TData = Policies>(
  ...params: Parameters<typeof useManageGetPoliciesSuspense<TData>>
) => useManageGetPoliciesSuspense<TData>(...params)
