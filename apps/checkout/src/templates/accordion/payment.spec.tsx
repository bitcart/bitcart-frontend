import { fireEvent, screen, within } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { makeInvoice, makePayment, makeStore, renderCheckout } from "#/checkout/testing"

import accordion from "."

const btc = makePayment({ id: "btc", name: "BTC", amount: "0.0015", payment_address: "bc1qbtc" })

const ltc = makePayment({
  id: "ltc",
  name: "LTC",
  amount: "1.25",
  payment_address: "ltc1qltc",
  payment_url: "litecoin:ltc1qltc?amount=1.25",
})

const continueButton = () => screen.getAllByRole("button", { name: "Continue" })

describe("accordion template", () => {
  test("shows the chosen method's payment details after the method choice", () => {
    renderCheckout({
      source: { invoice: makeInvoice({ payments: [btc, ltc] }) },
      screens: accordion,
    })

    fireEvent.click(screen.getByRole("button", { name: "LTC" }))
    fireEvent.click(continueButton()[0]!)

    expect(screen.getByText("1.25")).toBeInTheDocument()

    fireEvent.click(continueButton()[1]!)

    expect(screen.getByRole("button", { name: "Copy Address" })).toHaveTextContent("ltc1qltc")

    expect(screen.getByRole("link", { name: "Open in Wallet" })).toHaveAttribute(
      "href",
      "litecoin:ltc1qltc?amount=1.25",
    )
  })

  test("opens on the amount when there is a single method", () => {
    renderCheckout({ source: { invoice: makeInvoice({ payments: [btc] }) }, screens: accordion })

    const amountSection = screen.getByText("You pay").closest("div")!

    expect(within(amountSection.parentElement!).getByText("0.0015")).toBeVisible()
  })

  test("mentions the recommended fee next to the amount", () => {
    renderCheckout({
      source: {
        invoice: makeInvoice({ payments: [makePayment({ recommended_fee: 7 })] }),
        store: makeStore({ show_recommended_fee: true }),
      },
      screens: accordion,
    })

    expect(screen.getByText("Recommended fee: 7 sat/byte")).toBeInTheDocument()
  })

  test("makes the controls of collapsed sections inert", () => {
    renderCheckout({
      source: { invoice: makeInvoice({ payments: [btc, ltc] }) },
      screens: accordion,
    })

    expect(screen.getByRole("button", { name: "Copy Address" }).closest("[inert]")).not.toBeNull()
    expect(screen.getByRole("button", { name: "LTC" }).closest("[inert]")).toBeNull()
  })
})
