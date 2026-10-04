import { act, render, renderHook, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { afterEach, describe, expect, test, vi } from "vitest"

import { makeInvoice, makeModel } from "./fixtures"
import { useCheckout, useCheckoutCountdown } from "./hooks"
import type { CheckoutModel } from "./model"
import { CheckoutProvider } from "./runtime/provider"

const withModel =
  (model: CheckoutModel) =>
  ({ children }: { children: ReactNode }) => (
    <CheckoutProvider model={model}>{children}</CheckoutProvider>
  )

describe("useCheckout", () => {
  test("reads the model provided above it", () => {
    const model = makeModel()
    const { result } = renderHook(() => useCheckout(), { wrapper: withModel(model) })

    expect(result.current).toBe(model)
  })

  test("narrows the model to the requested phase", () => {
    const { result } = renderHook(() => useCheckout("payment"), { wrapper: withModel(makeModel()) })

    expect(result.current.payment.id).toBe("method-btc")
  })

  test("throws when the model is in another phase", () => {
    expect(() =>
      renderHook(() => useCheckout("select"), { wrapper: withModel(makeModel()) }),
    ).toThrow(/select.*payment/u)
  })

  test("throws outside a provider", () => {
    expect(() => renderHook(() => useCheckout())).toThrow(/CheckoutProvider/u)
  })
})

describe("useCheckoutCountdown", () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  test("counts down the time left on the invoice", async () => {
    vi.useFakeTimers()

    const { result } = renderHook(() => useCheckoutCountdown(), {
      wrapper: withModel(makeModel({ invoice: makeInvoice({ time_left: 125 }) })),
    })

    expect(result.current).toMatchObject({ formatted: "02:05", isExpired: false })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000)
    })

    expect(result.current.formatted).toBe("02:00")
  })

  test("re-renders only the components that show the countdown on each tick", async () => {
    vi.useFakeTimers()

    const renderModelReader = vi.fn()

    const ModelReader = () => {
      renderModelReader()

      return <p>{useCheckout().store.name}</p>
    }

    const CountdownReader = () => <p>{useCheckoutCountdown().formatted}</p>

    render(
      <CheckoutProvider model={makeModel({ invoice: makeInvoice({ time_left: 125 }) })}>
        <ModelReader />
        <CountdownReader />
      </CheckoutProvider>,
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3_000)
    })

    expect(screen.getByText("02:02")).toBeInTheDocument()
    expect(renderModelReader).toHaveBeenCalledOnce()
  })

  test("throws outside a provider", () => {
    expect(() => renderHook(() => useCheckoutCountdown())).toThrow(/CheckoutProvider/u)
  })
})
