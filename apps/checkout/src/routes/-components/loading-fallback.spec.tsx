import { render, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { CheckoutTestProviders } from "#/checkout/testing/checkout-harness"

import { LoadingFallback, ReceiptLoadingFallback } from "./loading-fallback"

describe.each([
  ["checkout", LoadingFallback],
  ["receipt", ReceiptLoadingFallback],
])("the %s loading state", (_page, Fallback) => {
  test("announces the load and hides its placeholders from assistive technology", () => {
    render(
      <CheckoutTestProviders>
        <Fallback />
      </CheckoutTestProviders>,
    )

    const status = screen.getByRole("status")

    expect(status).toHaveAttribute("aria-busy", "true")
    expect(status).toHaveTextContent("Loading…")
    expect(status.querySelector("[aria-hidden]")).not.toBeNull()
  })
})
