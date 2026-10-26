import { useMemo } from "react"

import { useCheckout } from "./hooks"
import type { CheckoutMethod } from "./model"
import { getMethodNetwork, getNetworkLabels } from "./networks"

const matchesQuery = (method: CheckoutMethod, normalizedQuery: string) => {
  const networkLabels = getNetworkLabels(getMethodNetwork(method))

  return [method.name, method.symbol, networkLabels?.badge, networkLabels?.name].some((field) =>
    field?.toLowerCase().includes(normalizedQuery),
  )
}

/**
 * The payment methods matching a free-text query by name, symbol or network, in their original
 * order.
 */
export const useMethodSearch = (query: string): CheckoutMethod[] => {
  const { methods } = useCheckout()
  const normalizedQuery = query.trim().toLowerCase()

  return useMemo(
    () => methods.filter((method) => matchesQuery(method, normalizedQuery)),
    [methods, normalizedQuery],
  )
}
