import { CHECKOUT_AMOUNT_TESTID, CHECKOUT_PAYMENT_ADDRESS_TESTID } from "@bitcart/qa"
import { act, fireEvent, screen } from "@testing-library/react"
import { describe, expect, onTestFinished, test, vi } from "vitest"

import {
  installFakeTerminal,
  makeInvoice,
  makePayment,
  makeStore,
  renderCheckout,
} from "#/checkout/testing"

import flow from "."

const btc = makePayment({ id: "btc", name: "BTC", payment_address: "bc1qbtcaddress000000" })

const ltc = makePayment({
  id: "ltc",
  name: "LTC",
  symbol: "ltc",
  amount: "1.25000000",
  payment_address: "ltc1qltcaddress000000",
  payment_url: "litecoin:ltc1qltcaddress000000?amount=1.25",
})

const renderFlow = (payments = [btc, ltc], invoice = {}) =>
  renderCheckout({
    source: { invoice: makeInvoice({ payments, ...invoice }) },
    screens: flow,
  })

const stubClipboard = (writeText: () => Promise<void>) =>
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })

describe("flow template", () => {
  test("asks for a method, then pays with the one chosen", () => {
    renderFlow()

    expect(screen.getByText("Choose how to pay")).toBeInTheDocument()
    expect(screen.queryByTestId(CHECKOUT_PAYMENT_ADDRESS_TESTID)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: /LTC/u }))

    expect(screen.getByText("Paying with")).toBeInTheDocument()
    expect(screen.getByTestId(CHECKOUT_AMOUNT_TESTID)).toHaveTextContent("1.25000000LTC")

    expect(screen.getByTestId(CHECKOUT_PAYMENT_ADDRESS_TESTID)).toHaveTextContent(
      "ltc1qltcaddress000000",
    )

    for (const link of screen.getAllByRole("link", { name: "Pay with wallet" })) {
      expect(link).toHaveAttribute("href", "litecoin:ltc1qltcaddress000000?amount=1.25")
    }
  })

  test("returns to the methods from the paying-with row", () => {
    renderFlow()

    fireEvent.click(screen.getByRole("button", { name: /LTC/u }))
    fireEvent.click(screen.getByRole("button", { name: "Change payment method" }))

    expect(screen.getByText("Choose how to pay")).toBeInTheDocument()
  })

  test("pays with the only method at once, offering no change", () => {
    renderFlow([btc])

    expect(screen.getByTestId(CHECKOUT_PAYMENT_ADDRESS_TESTID)).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Change payment method" })).not.toBeInTheDocument()
  })

  test("asks for any amount on a zero-price invoice, with nothing to copy but the address", () => {
    renderFlow([{ ...btc, amount: "0.00000000" }], { price: "0.00" })

    expect(screen.getByTestId(CHECKOUT_AMOUNT_TESTID)).toHaveTextContent("Send any amount")
    expect(screen.queryByRole("button", { name: /Copy amount/u })).not.toBeInTheDocument()
  })

  test("confirms a copied amount in place", async () => {
    stubClipboard(() => Promise.resolve())
    renderFlow([btc])

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy amount 0.00150000 BTC" }))
      await Promise.resolve()
    })

    expect(screen.getByText("Amount copied")).toBeInTheDocument()
  })

  test("says so in place when the amount can't be copied", async () => {
    stubClipboard(() => Promise.reject(new Error("denied")))
    document.execCommand = vi.fn(() => false)
    renderFlow([btc])

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy amount 0.00150000 BTC" }))
      await Promise.resolve()
    })

    expect(screen.getByText("Couldn't copy")).toBeInTheDocument()
    expect(screen.getByText("Amount not copied")).toBeInTheDocument()
  })

  test("shows the token contract for a token only", () => {
    const usdt = makePayment({ id: "usdt", name: "USDT", symbol: "usdt", contract: "0xdac17f95" })

    renderFlow([usdt])

    fireEvent.click(screen.getByRole("button", { name: "Token contract" }))

    expect(screen.getByRole("button", { name: /Copy contract/u })).toBeInTheDocument()
  })

  test("doesn't copy the amount of a Lightning invoice, which fixes it", () => {
    renderFlow([makePayment({ lightning: true, payment_address: `lnbc${"0".repeat(60)}` })])

    expect(screen.queryByRole("button", { name: /Copy amount/u })).not.toBeInTheDocument()
    expect(screen.getByTestId(CHECKOUT_PAYMENT_ADDRESS_TESTID)).toHaveTextContent("…")
  })

  test("shows the QR code, address and fee on a terminal, with nothing to press", () => {
    onTestFinished(installFakeTerminal())

    renderCheckout({
      source: {
        invoice: makeInvoice({ payments: [{ ...btc, recommended_fee: "3" }] }),
        store: makeStore({ show_recommended_fee: true }),
      },

      screens: flow,
    })

    expect(screen.getByTestId(CHECKOUT_PAYMENT_ADDRESS_TESTID)).toHaveTextContent(
      "bc1qbtcaddress000000",
    )

    expect(screen.getByText("Recommended fee: 3 sat/byte")).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Pay with wallet" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^Copy/u })).not.toBeInTheDocument()
  })
})
