import { renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, test } from "vitest"

import { makeInvoice, makeModel, makePayment } from "./fixtures"
import { useMethodSearch } from "./method-search"
import { CheckoutProvider } from "./runtime/provider"

const payments = [
  makePayment({ id: "btc", name: "BTC", symbol: "btc" }),
  makePayment({ id: "btc-ln", name: "BTC (⚡)", symbol: "btc", lightning: true }),
  makePayment({ id: "usdt", name: "USDT (TRC20)", symbol: "usdt" }),
]

const model = makeModel({ invoice: makeInvoice({ payments }) }, { selection: "explicit" })

const Wrapper = ({ children }: { children: ReactNode }) => (
  <CheckoutProvider model={model}>{children}</CheckoutProvider>
)

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
