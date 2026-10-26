import { screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { makeInvoice, makePayment } from "../fixtures"
import { useCheckout } from "../hooks"
import { renderCheckout } from "../testing/render-checkout"
import { MethodIcon } from "./method-summary"
import { MethodTitle } from "./method-title"

const Titles = () => {
  const { methods } = useCheckout()

  return (
    <ul>
      {methods.map((method) => (
        <li key={method.id}>
          <MethodTitle method={method} />
        </li>
      ))}
    </ul>
  )
}

const renderTitles = (payments: ReturnType<typeof makePayment>[]) => {
  renderCheckout({
    source: { invoice: makeInvoice({ payments }) },
    screens: { Payment: Titles },
  })

  return screen.getAllByRole("listitem").map((item) => item.textContent)
}

describe("MethodTitle", () => {
  test("reads as the ticker, with a labelled badge for Lightning", () => {
    const titles = renderTitles([
      makePayment({ id: "btc", name: "BTC" }),
      makePayment({ id: "btc-ln", name: "BTC (⚡)", lightning: true }),
    ])

    expect(titles).toStrictEqual(["BTC", "BTCLightning"])
  })

  test("prefers the merchant's label", () => {
    const titles = renderTitles([makePayment({ id: "btc", name: "Savings", label: "Savings" })])

    expect(titles).toStrictEqual(["Savings"])
  })

  test("keeps the backend's numbered names apart for unlabelled methods sharing a coin", () => {
    const titles = renderTitles([
      makePayment({ id: "btc-1", name: "BTC (1)" }),
      makePayment({ id: "btc-2", name: "BTC (2)" }),
      makePayment({ id: "btc-3", name: "Cold", label: "Cold" }),
    ])

    expect(titles).toStrictEqual(["BTC (1)", "BTC (2)", "Cold"])
  })

  describe("networks", () => {
    const token = (id: string, network: string | null, chainId: number | null = null) =>
      makePayment({
        id,
        name: id,
        symbol: "usdt",
        contract: "0xtoken",
        chain_id: chainId,
        wallet: network ? { network, sender_address_required: false, links: [] } : null,
      })

    const coin = (id: string, network: string) =>
      makePayment({
        id,
        name: id,
        symbol: "eth",
        wallet: { network, sender_address_required: false, links: [] },
      })

    test("badges a token with its network, named in full for screen readers", () => {
      expect(renderTitles([token("usdt-trc20", "tron:728126428")])).toStrictEqual([
        "USDTTRXon TRON",
      ])
    })

    test("tells apart one coin on several networks by badge, not by numbered names", () => {
      const titles = renderTitles([
        token("USDT (1)", "eip155:1"),
        token("USDT (2)", "tron:728126428"),
        token("USDT (3)", "eip155:56"),
      ])

      expect(titles).toStrictEqual([
        "USDTETHon Ethereum",
        "USDTTRXon TRON",
        "USDTBSCon BNB Smart Chain",
      ])
    })

    test("keeps numbered names for methods sharing a coin and its network", () => {
      const titles = renderTitles([token("USDT (1)", "eip155:1"), token("USDT (2)", "eip155:1")])

      expect(titles).toStrictEqual(["USDT (1)", "USDT (2)"])
    })

    test("leaves a native coin on its only network unbadged", () => {
      expect(renderTitles([coin("eth", "eip155:1")])).toStrictEqual(["ETH"])
    })

    test("badges a native coin the store also takes on another network", () => {
      expect(
        renderTitles([coin("eth", "eip155:1"), coin("eth-sepolia", "eip155:11155111")]),
      ).toStrictEqual(["ETHETHon Ethereum", "ETHSepoliaon Sepolia"])
    })

    test("reads the network of an invoice from before networks were named from its chain id", () => {
      expect(renderTitles([token("usdt", null, 56)])).toStrictEqual(["USDTBSCon BNB Smart Chain"])
    })

    test("numbers a network the checkout doesn't know by its chain id", () => {
      expect(renderTitles([token("usdt", "eip155:43114")])).toStrictEqual([
        "USDT43114on chain 43114",
      ])
    })
  })
})

describe("MethodIcon", () => {
  test("looks a TRC-20 token's icon up on its network", () => {
    renderCheckout({
      source: {
        invoice: makeInvoice({
          payments: [
            makePayment({
              symbol: "usdt",
              contract: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
              wallet: { network: "tron:728126428", sender_address_required: false, links: [] },
            }),
          ],
        }),
      },

      screens: { Payment: () => <MethodIcon method={useCheckout().methods[0]!} /> },
    })

    expect(document.querySelector("[data-network]")).toHaveAttribute(
      "data-network",
      "tron:728126428",
    )
  })
})
