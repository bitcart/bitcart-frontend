import {
  useManageGetPolicies,
  useManageGetPoliciesSuspense,
} from "#/endpoints/_internal/generated/manage"

import type { Policies } from "./types"

// TODO: Convert to a direct binding once the API schema provides the correct type.
export const usePolicies = <TData = Policies>(
  ...params: Parameters<typeof useManageGetPolicies<TData>>
) => useManageGetPolicies<TData>(...params)

// TODO: Convert to a direct binding once the API schema provides the correct type.
export const usePoliciesSuspense = <TData = Policies>(
  ...params: Parameters<typeof useManageGetPoliciesSuspense<TData>>
) => useManageGetPoliciesSuspense<TData>(...params)
