import { renderHook } from "@testing-library/react"
import type { ReactNode } from "react"
import { describe, expect, test } from "vitest"

import { makeInvoice, makeModel, makePayment } from "./fixtures"
import { useMethodSearch } from "./method-search"
import { CheckoutProvider } from "./runtime/provider"

const onNetwork = (network: string) => ({
  wallet: { network, sender_address_required: false, links: [] },
})

const payments = [
  makePayment({ id: "btc", name: "BTC", symbol: "btc" }),
  makePayment({ id: "btc-ln", name: "BTC (⚡)", symbol: "btc", lightning: true }),
  makePayment({ id: "usdt", name: "USDT (TRC20)", symbol: "usdt" }),
  makePayment({ id: "trx", name: "TRX", symbol: "trx", ...onNetwork("tron:728126428") }),
  makePayment({ id: "usdt-bep20", name: "USDT (2)", symbol: "usdt", ...onNetwork("eip155:56") }),
]

const model = makeModel({ invoice: makeInvoice({ payments }) }, { selection: "explicit" })

const Wrapper = ({ children }: { children: ReactNode }) => (
  <CheckoutProvider model={model}>{children}</CheckoutProvider>
)

const searchIds = (query: string) =>
  renderHook(() => useMethodSearch(query), { wrapper: Wrapper }).result.current.map(({ id }) => id)

describe("useMethodSearch", () => {
  test.each([
    ["", ["btc", "btc-ln", "usdt", "trx", "usdt-bep20"]],
    ["   ", ["btc", "btc-ln", "usdt", "trx", "usdt-bep20"]],
    ["btc", ["btc", "btc-ln"]],
    ["trc", ["usdt"]],
    ["  UsDt ", ["usdt", "usdt-bep20"]],
    ["tron", ["trx"]],
    ["bsc", ["usdt-bep20"]],
    ["smart chain", ["usdt-bep20"]],
    ["xmr", []],
  ])("finds %j among the methods", (query, expected) => {
    expect(searchIds(query)).toStrictEqual(expected)
  })
})
