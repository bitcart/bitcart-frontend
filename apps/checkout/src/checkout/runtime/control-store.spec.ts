import { describe, expect, test, vi } from "vitest"

import { createCheckoutControl, INITIAL_CHECKOUT_UI_STATE } from "./control-store"

describe("createCheckoutControl", () => {
  test("starts with no choice", () => {
    expect(createCheckoutControl().state).toStrictEqual(INITIAL_CHECKOUT_UI_STATE)
  })

  test("ends a method change once a method is chosen", () => {
    const control = createCheckoutControl()

    control.actions.changeMethod()
    control.actions.selectMethod("method-ltc")

    expect(control.state).toStrictEqual({
      ...INITIAL_CHECKOUT_UI_STATE,
      chosenMethodId: "method-ltc",
    })
  })

  test("keeps the chosen method when a change is cancelled", () => {
    const control = createCheckoutControl()

    control.actions.selectMethod("method-ltc")
    control.actions.changeMethod()
    control.actions.cancelChange()

    expect(control.state).toStrictEqual({
      ...INITIAL_CHECKOUT_UI_STATE,
      chosenMethodId: "method-ltc",
    })
  })

  test("cancels the redirect", () => {
    const control = createCheckoutControl()

    control.actions.cancelRedirect()

    expect(control.state.isRedirectCancelled).toBe(true)
  })

  test("shows and hides the ETH plugin offer", () => {
    const control = createCheckoutControl()

    control.actions.showEthPluginOffer()

    expect(control.state.isShowingEthPluginOffer).toBe(true)

    control.actions.hideEthPluginOffer()

    expect(control.state.isShowingEthPluginOffer).toBe(false)
  })

  test.each([
    ["a method is chosen", "selectMethod"],
    ["the method changes", "changeMethod"],
  ] as const)("hides the ETH plugin offer when %s", (_case, action) => {
    const control = createCheckoutControl()

    control.actions.showEthPluginOffer()
    control.actions[action]("method-ltc")

    expect(control.state.isShowingEthPluginOffer).toBe(false)
  })

  test("resets to no choice", () => {
    const control = createCheckoutControl()

    control.actions.selectMethod("method-ltc")
    control.actions.changeMethod()
    control.actions.cancelRedirect()
    control.actions.showEthPluginOffer()
    control.actions.reset()

    expect(control.state).toStrictEqual(INITIAL_CHECKOUT_UI_STATE)
  })

  test("notifies no subscriber when an action changes nothing", () => {
    const control = createCheckoutControl()
    const listener = vi.fn()

    control.actions.selectMethod("method-ltc")
    control.subscribe(listener)
    control.actions.selectMethod("method-ltc")
    control.actions.cancelChange()

    expect(listener).not.toHaveBeenCalled()
  })
})
