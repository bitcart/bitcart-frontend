import { describe, expect, test, vi } from "vitest"

import { createWalletPayControl, INITIAL_WALLET_PAY_STATE } from "./control-store"

const WALLET = { id: "eip155:test", name: "Test Wallet", icon: null }

const begun = (attemptId = "attempt-1") => {
  const control = createWalletPayControl()

  control.actions.begin({ id: attemptId, methodId: "method-eth", wallet: WALLET })

  return control
}

describe("createWalletPayControl", () => {
  test("opens the sheet on the first step of an attempt", () => {
    expect(begun().state).toStrictEqual({
      ...INITIAL_WALLET_PAY_STATE,
      isSheetOpen: true,

      attempt: {
        id: "attempt-1",
        methodId: "method-eth",
        wallet: WALLET,
        step: { kind: "connecting" },
      },
    })
  })

  test("ignores a step of an attempt no longer shown", () => {
    const control = begun("attempt-1")

    control.actions.begin({ id: "attempt-2", methodId: "method-eth", wallet: WALLET })
    control.actions.advance("attempt-1", { kind: "confirming" })

    expect(control.state.attempt?.step).toStrictEqual({ kind: "connecting" })
  })

  test("closing the sheet drops the attempt shown in it", () => {
    const control = begun()

    control.actions.closeSheet()

    expect(control.state).toStrictEqual(INITIAL_WALLET_PAY_STATE)
  })

  test("keeps a payment sent by an attempt no longer shown, and leaves the sheet as it is", () => {
    const control = begun("attempt-1")

    control.actions.dismissAttempt()
    control.actions.recordSent("attempt-1", "method-eth", "0xhash")

    expect(control.state).toStrictEqual({
      isSheetOpen: true,
      attempt: null,
      sentHashes: { "method-eth": "0xhash" },
    })
  })

  test("clears a method's sent payment", () => {
    const control = begun()

    control.actions.recordSent("attempt-1", "method-eth", "0xhash")
    control.actions.clearSent("method-eth")

    expect(control.state.sentHashes).toStrictEqual({})
  })

  test.each([
    ["opening an open sheet", (control: ReturnType<typeof begun>) => control.actions.openSheet()],
    [
      "advancing another attempt",
      (control: ReturnType<typeof begun>) =>
        control.actions.advance("attempt-2", { kind: "checking" }),
    ],
    [
      "clearing a method with nothing sent",
      (control: ReturnType<typeof begun>) => control.actions.clearSent("method-btc"),
    ],
  ])("stays silent when %s", (_case, act) => {
    const control = begun()
    const listener = vi.fn()

    control.subscribe(listener)
    act(control)

    expect(listener).not.toHaveBeenCalled()
  })

  test("stays silent when dismissing or closing with nothing shown", () => {
    const control = createWalletPayControl()
    const listener = vi.fn()

    control.subscribe(listener)
    control.actions.dismissAttempt()
    control.actions.closeSheet()

    expect(listener).not.toHaveBeenCalled()
  })
})
