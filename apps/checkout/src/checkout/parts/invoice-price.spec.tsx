import { screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { makeInvoice, makePayment } from "../fixtures"
import { renderCheckout } from "../testing/render-checkout"
import { InvoicePrice } from "./invoice-price"

const renderPrice = (invoice: Parameters<typeof makeInvoice>[0]) =>
  renderCheckout({
    source: { invoice: makeInvoice({ currency: "USD", ...invoice }) },
    screens: { Payment: () => <InvoicePrice />, Status: () => <InvoicePrice /> },
  })

describe("InvoicePrice", () => {
  test.each([
    ["25.00", "$25.00"],
    ["0.00", "Any amount"],
  ])("shows a price of %s as %s", (price, expected) => {
    renderPrice({ price, payments: [makePayment({ effective_price: price })] })

    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  test("shows the price a discount lowered for the chosen method", () => {
    renderPrice({
      price: "100.00",
      payments: [makePayment({ effective_price: "90.00" })],
    })

    expect(screen.getByText("$90.00")).toBeInTheDocument()
  })

  test("shows the invoice's effective price once no method is being paid", () => {
    renderPrice({ price: "100.00", effective_price: "90.00", status: "complete" })

    expect(screen.getByText("$90.00")).toBeInTheDocument()
  })
})
