import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, test } from "vitest"

import { makeInvoice, makePayment, makeSource } from "../fixtures"
import type { CheckoutSource } from "../model"
import { useCheckoutControl, useCheckoutModel } from "./control"
import { createCheckoutControl, INITIAL_CHECKOUT_UI_STATE } from "./control-store"

describe("useCheckoutControl", () => {
  const renderControl = (invoiceId: string) =>
    renderHook((props: { invoiceId: string }) => useCheckoutControl(props.invoiceId), {
      initialProps: { invoiceId },
    })

  test("keeps the same control for the same invoice", () => {
    const { result, rerender } = renderControl("invoice-1")
    const control = result.current

    rerender({ invoiceId: "invoice-1" })

    expect(result.current).toBe(control)
  })

  test("starts a fresh control for another invoice", () => {
    const { result, rerender } = renderControl("invoice-1")

    act(() => result.current.actions.selectMethod("method-ltc"))
    rerender({ invoiceId: "invoice-2" })

    expect(result.current.state).toStrictEqual(INITIAL_CHECKOUT_UI_STATE)
  })
})

describe("useCheckoutModel", () => {
  const payments = [makePayment({ id: "method-btc" }), makePayment({ id: "method-ltc" })]

  const renderModel = (source: CheckoutSource) => {
    const control = createCheckoutControl()

    const rendered = renderHook(
      (props: { source: CheckoutSource }) =>
        useCheckoutModel(props.source, { selection: "preselect", control }),
      { initialProps: { source } },
    )

    return { ...rendered, control }
  }

  afterEach(() => {
    document.documentElement.classList.remove("dark")
  })

  test("re-derives the model when the control changes", () => {
    const { result, control } = renderModel(makeSource({ invoice: makeInvoice({ payments }) }))

    act(() => control.actions.selectMethod("method-ltc"))

    expect(result.current).toMatchObject({ phase: "payment", selectedMethodId: "method-ltc" })
  })

  test("keeps the model while its inputs are unchanged", () => {
    const source = makeSource()
    const { result, rerender } = renderModel(source)
    const model = result.current

    rerender({ source })

    expect(result.current).toBe(model)
  })

  test("keeps the model when an action changes nothing", () => {
    const { result, control } = renderModel(makeSource({ invoice: makeInvoice({ payments }) }))

    act(() => control.actions.selectMethod("method-ltc"))

    const model = result.current

    act(() => control.actions.selectMethod("method-ltc"))

    expect(result.current).toBe(model)
  })

  test("follows the theme toggle", async () => {
    const LIGHT_LOGO = "https://example.com/logo-light.svg"
    const DARK_LOGO = "https://example.com/logo-dark.svg"

    const { result } = renderModel(
      makeSource({ appearance: { logos: { light: LIGHT_LOGO, dark: DARK_LOGO } } }),
    )

    //* The theme mode is observed with a `MutationObserver`, whose callbacks run as microtasks.
    await act(async () => {
      document.documentElement.classList.add("dark")
      await Promise.resolve()
    })

    expect(result.current.branding.logo).toStrictEqual({ url: DARK_LOGO, backdrop: null })
  })
})
