import { render } from "@testing-library/react"

import type { CheckoutSource } from "../model"
import { CheckoutTestApp, type CheckoutTestAppProps } from "./checkout-harness"

/**
 * Renders a checkout as the app does. `refetch` simulates an invoice refetch: it rerenders the tree
 * with updated source data and preserves its state.
 */
export const renderCheckout = (params: CheckoutTestAppProps) => {
  const rendered = render(<CheckoutTestApp {...params} />)

  const refetch = (source: Partial<CheckoutSource>) =>
    rendered.rerender(<CheckoutTestApp {...params} source={{ ...params.source, ...source }} />)

  return { ...rendered, refetch }
}
