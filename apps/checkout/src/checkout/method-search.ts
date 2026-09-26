import { useMemo } from "react"

import { useCheckout } from "./hooks"
import type { CheckoutMethod } from "./model"

const matchesQuery = ({ name, symbol }: CheckoutMethod, normalizedQuery: string) =>
  [name, symbol].some((field) => field.toLowerCase().includes(normalizedQuery))

/**
 * The payment methods matching a free-text query by name or symbol, in their original order.
 */
export const useMethodSearch = (query: string): CheckoutMethod[] => {
  const { methods } = useCheckout()
  const normalizedQuery = query.trim().toLowerCase()

  return useMemo(
    () => methods.filter((method) => matchesQuery(method, normalizedQuery)),
    [methods, normalizedQuery],
  )
}
