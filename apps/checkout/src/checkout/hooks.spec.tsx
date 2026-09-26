import { renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, test } from "vitest"

import { useCheckout } from "./hooks"
import { useCheckoutModel, type CheckoutModel } from "./model"
import { CheckoutProvider } from "./runtime/provider"
import { makeSource } from "./testing/fixtures"

const renderPaymentModel = () =>
  renderHook(() => useCheckoutModel(makeSource(), { selection: "preselect" })).result.current

const withModel =
  (model: CheckoutModel) =>
  ({ children }: { children: ReactNode }) => (
    <CheckoutProvider model={model}>{children}</CheckoutProvider>
  )

describe("useCheckout", () => {
  test("reads the model provided above it", () => {
    const model = renderPaymentModel()
    const { result } = renderHook(() => useCheckout(), { wrapper: withModel(model) })

    expect(result.current).toBe(model)
  })

  test("narrows the model to the requested phase", () => {
    const model = renderPaymentModel()
    const { result } = renderHook(() => useCheckout("payment"), { wrapper: withModel(model) })

    expect(result.current.payment.id).toBe("method-btc")
  })

  test("throws when the model is in another phase", () => {
    const model = renderPaymentModel()

    expect(() => renderHook(() => useCheckout("select"), { wrapper: withModel(model) })).toThrow(
      /select.*payment/u,
    )
  })

  test("throws outside a provider", () => {
    expect(() => renderHook(() => useCheckout())).toThrow(/CheckoutProvider/u)
  })
})
