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

    expect(control.state).toStrictEqual({ chosenMethodId: "method-ltc", isChangingMethod: false })
  })

  test("keeps the chosen method when a change is cancelled", () => {
    const control = createCheckoutControl()

    control.actions.selectMethod("method-ltc")
    control.actions.changeMethod()
    control.actions.cancelChange()

    expect(control.state).toStrictEqual({ chosenMethodId: "method-ltc", isChangingMethod: false })
  })

  test("resets to no choice", () => {
    const control = createCheckoutControl()

    control.actions.selectMethod("method-ltc")
    control.actions.changeMethod()
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
