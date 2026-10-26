import { CHECKOUT_RECEIPT_TESTID } from "@bitcart/qa"
import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, onTestFinished, test, vi } from "vitest"

import { makeInvoice, makePayment, makeRefund, makeSource, makeStore } from "../fixtures"
import type { CheckoutSource } from "../model"
import { installFakeTerminal } from "../terminal"
import { CheckoutTestProviders } from "../testing/checkout-harness"
import { CheckoutReceiptView } from "./receipt-view"

const TX_HASH = "4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b"

const paidInvoice = (overrides: Parameters<typeof makeInvoice>[0] = {}) =>
  makeInvoice({
    status: "complete",
    payment_id: "method-btc",
    sent_amount: "0.00150000",
    sent_price: "100.00",
    tx_hashes: [TX_HASH],
    transactions: [{ tx_hash: TX_HASH, amount: "0.00150000" }],
    ...overrides,
  })

const renderReceipt = (source: Partial<CheckoutSource>) =>
  render(
    <CheckoutTestProviders>
      <CheckoutReceiptView source={makeSource(source)} unavailable={<p>No receipt</p>} />
    </CheckoutTestProviders>,
  )

const receipt = () => within(screen.getByTestId(CHECKOUT_RECEIPT_TESTID))

describe("CheckoutReceiptView", () => {
  test("shows the receipt of a paid invoice", () => {
    renderReceipt({ invoice: paidInvoice({ order_id: "1042" }) })

    expect(receipt().getByText("Paid")).toBeInTheDocument()
    expect(receipt().getByText("Example Store")).toBeInTheDocument()
    expect(receipt().getByText("1042")).toBeInTheDocument()
    expect(receipt().getByText("$100")).toBeInTheDocument()
    expect(receipt().getByText("0.00150000 BTC")).toBeInTheDocument()

    expect(receipt().getByRole("link", { name: TX_HASH })).toHaveAttribute(
      "href",
      `https://explorer.example.com/tx/${TX_HASH}`,
    )
  })

  test.each([
    ["pending", makeInvoice()],
    ["expired unpaid", makeInvoice({ status: "expired" })],
  ])("renders the fallback for a %s invoice", (_name, invoice) => {
    renderReceipt({ invoice })

    expect(screen.getByText("No receipt")).toBeInTheDocument()
    expect(screen.queryByTestId(CHECKOUT_RECEIPT_TESTID)).not.toBeInTheDocument()
  })

  test("names a payment that failed to confirm", () => {
    renderReceipt({
      invoice: paidInvoice({ status: "invalid", exception_status: "failed_confirm" }),
    })

    expect(receipt().getByText("Failed to confirm")).toBeInTheDocument()
  })

  test("shows the amount paid next to the total, in fiat and in crypto", () => {
    renderReceipt({ invoice: paidInvoice({ exception_status: "paid_over", sent_price: "120.00" }) })

    expect(receipt().getByText("Total").nextSibling).toHaveTextContent("$100")

    expect(receipt().getByText("Amount paid").nextSibling).toHaveTextContent(
      /^\$120\.00\s*0\.00150000 BTC$/,
    )
  })

  test("shows the invoice's refund", () => {
    renderReceipt({
      invoice: paidInvoice({ status: "refunded", refund_id: "refund-1" }),
      refund: makeRefund({ amount: "40.00", payout_status: "sent", tx_hash: "refund-tx" }),
    })

    expect(receipt().getByText("Refunded")).toBeInTheDocument()
    expect(receipt().getByText("Refund").nextSibling).toHaveTextContent("$40.00")
    expect(receipt().getByText("Refund status").nextSibling).toHaveTextContent("Sent")
    expect(receipt().getByText("refund-tx")).toBeInTheDocument()

    expect(receipt().getByRole("link", { name: "View refund" })).toHaveAttribute(
      "href",
      "/refunds/refund-1",
    )
  })

  test("asks for the address of an unclaimed refund", () => {
    renderReceipt({
      invoice: paidInvoice({ refund_id: "refund-1" }),
      refund: makeRefund(),
    })

    expect(receipt().getByText("Refund status").nextSibling).toHaveTextContent(
      "Awaiting your address",
    )

    expect(receipt().getByRole("link", { name: "Claim refund" })).toHaveAttribute(
      "href",
      "/refunds/refund-1",
    )
  })

  test("leaves the refund link off a terminal's receipt", () => {
    onTestFinished(installFakeTerminal())

    renderReceipt({
      invoice: paidInvoice({ refund_id: "refund-1" }),
      refund: makeRefund(),
    })

    expect(receipt().getByText("Refund status")).toBeInTheDocument()
    expect(receipt().queryByText("Claim refund")).not.toBeInTheDocument()
  })

  test("shows each transaction's amount only for a payment split across several", () => {
    const { unmount } = renderReceipt({ invoice: paidInvoice() })

    expect(receipt().getAllByText("0.00150000 BTC")).toHaveLength(1)

    unmount()

    renderReceipt({
      invoice: paidInvoice({
        tx_hashes: ["tx-1", "tx-2"],

        transactions: [
          { tx_hash: "tx-1", amount: "0.00100000" },
          { tx_hash: "tx-2", amount: "0.00050000" },
        ],
      }),
    })

    expect(receipt().getByText("0.00100000 BTC")).toBeInTheDocument()
    expect(receipt().getByText("0.00050000 BTC")).toBeInTheDocument()
  })

  test("labels a Lightning payment by its hash, without an explorer link", () => {
    renderReceipt({ invoice: paidInvoice({ payments: [makePayment({ lightning: true })] }) })

    expect(receipt().getByText("Payment hash")).toBeInTheDocument()
    expect(receipt().getByText(TX_HASH)).toBeInTheDocument()
    expect(receipt().queryByRole("link", { name: TX_HASH })).not.toBeInTheDocument()
  })

  test("shows the store's support contact", () => {
    renderReceipt({
      invoice: paidInvoice({ id: "invoice-42" }),
      store: makeStore({ support_email: "help@example.com" }),
    })

    expect(receipt().getByRole("link", { name: "help@example.com" })).toHaveAttribute(
      "href",
      "mailto:help@example.com?subject=Invoice%20invoice-42",
    )
  })

  test("prints from its print button", () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => undefined)

    renderReceipt({ invoice: paidInvoice() })
    fireEvent.click(receipt().getByRole("button", { name: "Print receipt" }))

    expect(print).toHaveBeenCalledOnce()
  })

  test("prints on the terminal's own printer", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => undefined)
    const onInvoke = vi.fn()
    onTestFinished(installFakeTerminal({ onInvoke }))

    renderReceipt({ invoice: paidInvoice() })
    fireEvent.click(receipt().getByRole("button", { name: "Print receipt" }))

    expect(await receipt().findByRole("button", { name: "Print again" })).toBeEnabled()
    expect(onInvoke).toHaveBeenCalledWith("printer.print", expect.anything())
    expect(print).not.toHaveBeenCalled()
  })

  test("explains a failed print on the terminal's printer", async () => {
    onTestFinished(installFakeTerminal({ failWith: "PRINTER_COVER_OPEN" }))

    renderReceipt({ invoice: paidInvoice() })
    fireEvent.click(receipt().getByRole("button", { name: "Print receipt" }))

    expect(await receipt().findByRole("alert")).toHaveTextContent("Printer cover is open")
  })

  test("links nowhere off the terminal", () => {
    onTestFinished(installFakeTerminal())

    renderReceipt({
      invoice: paidInvoice(),
      store: makeStore({ support_email: "help@example.com" }),
    })

    expect(receipt().getByText(TX_HASH)).toBeInTheDocument()
    expect(receipt().getByText("help@example.com")).toBeInTheDocument()
    expect(receipt().queryAllByRole("link")).toHaveLength(0)
  })

  test("offers no print on a terminal without a printer", () => {
    onTestFinished(installFakeTerminal({ printer: false }))

    renderReceipt({ invoice: paidInvoice() })

    expect(receipt().queryByRole("button", { name: /Print/ })).not.toBeInTheDocument()
  })
})
