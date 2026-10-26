import type { bitcartInvoices } from "@bitcart/client-sdk/endpoints"
import { CHECKOUT_AMOUNT_BREAKDOWN_TESTID } from "@bitcart/qa"
import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { makeInvoice, makePayment } from "../fixtures"
import { renderCheckout } from "../testing/render-checkout"
import { AmountBreakdown } from "./amount-breakdown"

const renderBreakdown = (
  payment: Partial<bitcartInvoices.InvoicePayment>,
  invoice: Partial<bitcartInvoices.Invoice> = {},
) => {
  renderCheckout({
    source: {
      invoice: makeInvoice({ price: "100.00", payments: [makePayment(payment)], ...invoice }),
    },
    screens: { Payment: () => <AmountBreakdown /> },
  })

  fireEvent.click(screen.getByRole("button", { name: "Price breakdown" }))
}

const row = (term: string) => screen.getByText(term).nextElementSibling

describe("AmountBreakdown", () => {
  test("strikes through the price a discount lowered, naming the discount", () => {
    renderBreakdown({
      amount: "0.00135000",
      effective_price: "90.00",
      applied_discount: { name: "Autumn sale", percent: 10 },
    })

    expect(row("Order amount")).toHaveTextContent("0.00135000 BTC")
    expect(row("Discount")).toHaveTextContent("Autumn sale −10%")
    expect(screen.getByText("$100.00", { selector: "s" })).toBeInTheDocument()
    expect(screen.getByText("$90.00, discounted from $100.00")).toBeInTheDocument()
  })

  test("adds the network cost to the order amount", () => {
    renderBreakdown({
      amount: "0.00151000",
      subtotal: "0.00150000",
      effective_price: "100.00",
      network_fee: "0.00001000",
    })

    expect(row("Order amount")).toHaveTextContent("0.00150000 BTC")
    expect(row("Network cost")).toHaveTextContent("+0.00001000 BTC")
  })

  test("subtracts what a partial payment already paid", () => {
    renderBreakdown(
      {
        amount: "0.00151000",
        subtotal: "0.00150000",
        network_fee: "0.00001000",
        due: "0.00101000",
        due_price: "66.67",
      },
      { exception_status: "paid_partial", payment_id: "method-btc", sent_amount: "0.00050000" },
    )

    expect(row("Already paid")).toHaveTextContent("−0.00050000 BTC")
    expect(row("Due")).toHaveTextContent("0.00101000 BTC$66.67")
  })

  test("subtracts each transfer of a partial payment made in several", () => {
    renderBreakdown(
      { due: "0.00100000", due_price: "66.67" },
      {
        exception_status: "paid_partial",
        payment_id: "method-btc",
        sent_amount: "0.00050000",

        transactions: [
          { tx_hash: "tx-1", amount: "0.00020000" },
          { tx_hash: "tx-2", amount: "0.00030000" },
        ],
      },
    )

    expect(row("Payment 1")).toHaveTextContent("−0.00020000 BTC")
    expect(row("Payment 2")).toHaveTextContent("−0.00030000 BTC")
    expect(screen.queryByText("Already paid")).not.toBeInTheDocument()
  })

  test.each([
    ["at full price", {}, {}],
    ["on an invoice that accepts any amount", { amount: "0.00000000" }, { price: "0.00" }],

    [
      "for one transfer of a partial payment at full price",
      { due: "0.00100000", due_price: "66.67" },

      {
        exception_status: "paid_partial" as const,
        payment_id: "method-btc",
        sent_amount: "0.00050000",
        transactions: [{ tx_hash: "tx-1", amount: "0.00050000" }],
      },
    ],
  ])("shows nothing %s", (_case, payment, invoice) => {
    renderCheckout({
      source: { invoice: makeInvoice({ payments: [makePayment(payment)], ...invoice }) },
      screens: { Payment: () => <AmountBreakdown /> },
    })

    expect(screen.queryByTestId(CHECKOUT_AMOUNT_BREAKDOWN_TESTID)).not.toBeInTheDocument()
  })
})
