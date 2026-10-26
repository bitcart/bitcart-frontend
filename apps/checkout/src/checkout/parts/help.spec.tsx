import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { makeInvoice, makeModel, makePayment, makeRefund } from "../fixtures"
import { getHelpLead } from "../help"
import type { CheckoutSource } from "../model"
import { renderCheckout } from "../testing/render-checkout"
import { CheckoutHelp } from "./help"

const partial = {
  invoice: makeInvoice({
    payment_id: "method-btc",
    exception_status: "paid_partial",
    sent_amount: "0.00050000",
    payments: [makePayment({ due: "0.00100000", due_price: "66.67" })],
  }),
}

describe("getHelpLead", () => {
  test.each<[string, Partial<CheckoutSource>, ReturnType<typeof getHelpLead>]>([
    ["a new invoice", {}, { topic: null, isContactFirst: false }],
    ["a partial payment", partial, { topic: "partial", isContactFirst: false }],
    [
      "a payment waiting for confirmations",
      { invoice: makeInvoice({ status: "paid" }) },
      { topic: "pending", isContactFirst: false },
    ],
    [
      "an expired invoice",
      { invoice: makeInvoice({ status: "expired" }) },
      { topic: "expired", isContactFirst: false },
    ],
    [
      "a complete invoice",
      { invoice: makeInvoice({ status: "complete" }) },
      { topic: "credited", isContactFirst: false },
    ],
    [
      "an overpaid invoice",
      {
        invoice: makeInvoice({
          status: "complete",
          exception_status: "paid_over",
          payment_id: "method-btc",
          sent_amount: "0.00200000",
        }),
      },
      { topic: null, isContactFirst: true },
    ],
    [
      "an unclaimed refund",
      {
        invoice: makeInvoice({ status: "complete", refund_id: "refund-1" }),
        refund: makeRefund(),
      },
      { topic: null, isContactFirst: false },
    ],
    [
      "a pending refund",
      {
        invoice: makeInvoice({ status: "complete", refund_id: "refund-1" }),
        refund: makeRefund({ payout_status: "pending" }),
      },
      { topic: null, isContactFirst: true },
    ],
    [
      "an invalid invoice",
      { invoice: makeInvoice({ status: "invalid" }) },
      { topic: null, isContactFirst: true },
    ],
    [
      "an invoice no method can pay",
      { invoice: makeInvoice({ payments: [] }) },
      { topic: null, isContactFirst: true },
    ],
  ])("leads with the right help for %s", (_case, source, expected) => {
    expect(getHelpLead(makeModel(source))).toStrictEqual(expected)
  })
})

describe("CheckoutHelp", () => {
  test("opens on the current state's question, and shows lead-only topics only then", () => {
    renderCheckout({ source: partial, screens: { Payment: () => <CheckoutHelp /> } })

    fireEvent.click(screen.getByRole("button", { name: "Help" }))

    expect(screen.getByRole("dialog", { name: "Help with this payment" })).toBeInTheDocument()

    expect(
      screen.getByRole("button", { name: "I sent less than the full amount" }),
    ).toHaveAttribute("aria-expanded", "true")

    expect(screen.queryByText(/hasn't credited my payment/u)).not.toBeInTheDocument()
  })
})
