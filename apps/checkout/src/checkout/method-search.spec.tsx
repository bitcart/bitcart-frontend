import { renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, test } from "vitest"

import { useMethodSearch } from "./method-search"
import { useCheckoutModel } from "./model"
import { CheckoutProvider } from "./runtime/provider"
import { makeInvoice, makePayment, makeSource } from "./testing/fixtures"

const payments = [
  makePayment({ id: "btc", name: "BTC", symbol: "btc" }),
  makePayment({ id: "btc-ln", name: "BTC (⚡)", symbol: "btc", lightning: true }),
  makePayment({ id: "usdt", name: "USDT (TRC20)", symbol: "usdt" }),
]

const Wrapper = ({ children }: { children: ReactNode }) => {
  const model = useCheckoutModel(makeSource({ invoice: makeInvoice({ payments }) }), {
    selection: "explicit",
  })

  return <CheckoutProvider model={model}>{children}</CheckoutProvider>
}

const searchIds = (query: string) =>
  renderHook(() => useMethodSearch(query), { wrapper: Wrapper }).result.current.map(({ id }) => id)

describe("useMethodSearch", () => {
  test.each([
    ["", ["btc", "btc-ln", "usdt"]],
    ["   ", ["btc", "btc-ln", "usdt"]],
    ["btc", ["btc", "btc-ln"]],
    ["trc", ["usdt"]],
    ["  UsDt ", ["usdt"]],
    ["xmr", []],
  ])("finds %j among the methods", (query, expected) => {
    expect(searchIds(query)).toStrictEqual(expected)
  })
})
