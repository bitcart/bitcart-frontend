import { CHECKOUT_REFUND_TESTID } from "@bitcart/qa"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import {
  makeInvoice,
  makePayment,
  makePolicies,
  makeRefund,
  makeSource,
  makeStore,
} from "../fixtures"
import type { CheckoutSource } from "../model"
import { getRefundPage, type CheckoutRefundPage } from "../refund/page"
import { CheckoutTestProviders } from "../testing/checkout-harness"
import { CheckoutRefundView } from "./refund-view"

const ADDRESS = "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"
const TX_HASH = "9b0fc92260312ce44e74ef369f5c66bbb85848f2eddd5a7a1cde251e54ccfdd5"

const paidInvoice = (payment = makePayment()) =>
  makeInvoice({
    id: "invoice-42",
    status: "complete",
    payments: [payment],
    payment_id: payment.id,
    refund_id: "refund-1",
  })

const renderRefund = ({
  refund = makeRefund({ amount: "40.00" }),
  invoice = paidInvoice(),
  store = makeStore(),
  submit = vi.fn<CheckoutRefundPage["submit"]>().mockResolvedValue("accepted"),
}: {
  refund?: ReturnType<typeof makeRefund>
  invoice?: ReturnType<typeof makeInvoice>
  store?: ReturnType<typeof makeStore>
  submit?: CheckoutRefundPage["submit"]
} = {}) => {
  const source: CheckoutSource = makeSource({ invoice, store, policies: makePolicies() })
  const page = getRefundPage(refund, invoice, source.policies.explorer_urls, submit)

  render(
    <CheckoutTestProviders>
      <CheckoutRefundView source={source} page={page} />
    </CheckoutTestProviders>,
  )

  return { submit }
}

const refundPage = () => within(screen.getByTestId(CHECKOUT_REFUND_TESTID))
const addressField = () => screen.getByRole("textbox", { name: /Your BTC address/u })

const continueWith = (address: string) => {
  fireEvent.change(addressField(), { target: { value: address } })
  fireEvent.click(screen.getByRole("button", { name: "Continue" }))
}

describe("CheckoutRefundView", () => {
  test("asks for the address of an unclaimed refund, in the store's name", () => {
    renderRefund()

    expect(refundPage().getByRole("heading", { name: "Refund from Example Store" })).toBeVisible()
    expect(refundPage().getByText("$40.00")).toBeInTheDocument()
    expect(refundPage().getByText("Invoice #invoice-42")).toBeInTheDocument()
    expect(addressField()).toBeInTheDocument()

    expect(
      refundPage().getByText("Sent in BTC at the exchange rate on the day the store sends it."),
    ).toBeInTheDocument()
  })

  test("drops the rate note for a refund already in the paid coin", () => {
    renderRefund({ refund: makeRefund({ amount: "0.00060000", currency: "btc" }) })

    expect(refundPage().getByText("0.00060000 BTC")).toBeInTheDocument()
    expect(refundPage().queryByText(/exchange rate/u)).not.toBeInTheDocument()
  })

  test("warns a buyer who paid with Lightning that the refund goes on-chain", () => {
    renderRefund({
      invoice: paidInvoice(makePayment({ id: "method-ln", lightning: true, name: "BTC (⚡)" })),
    })

    expect(refundPage().getByText("Refunds are sent on-chain")).toBeInTheDocument()
    expect(addressField()).toBeInTheDocument()
  })

  test("names the paid method in the label of a token refund", () => {
    renderRefund({ invoice: paidInvoice(makePayment({ symbol: "usdt", name: "USDT (TRC20)" })) })

    expect(
      screen.getByRole("textbox", { name: /Your USDT \(TRC20\) address/u }),
    ).toBeInTheDocument()

    expect(refundPage().queryByText("Refunds are sent on-chain")).not.toBeInTheDocument()
  })

  test("requires an address before review", async () => {
    const { submit } = renderRefund()

    continueWith("   ")

    expect(await screen.findByText("Enter your address.")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Submit refund" })).not.toBeInTheDocument()
    expect(submit).not.toHaveBeenCalled()
  })

  test("reviews the address before submitting it", async () => {
    const { submit } = renderRefund()

    continueWith(` ${ADDRESS} `)

    const submitButton = await screen.findByRole("button", { name: "Submit refund" })

    expect(refundPage().getByText(/Refunds can't be reversed/u)).toBeInTheDocument()
    expect(refundPage().getByText(ADDRESS.slice(0, 8))).toBeInTheDocument()
    expect(submit).not.toHaveBeenCalled()

    fireEvent.click(submitButton)

    await waitFor(() => expect(submit).toHaveBeenCalledExactlyOnceWith(ADDRESS))
  })

  test("returns to the address to edit it", async () => {
    renderRefund()

    continueWith(ADDRESS)
    fireEvent.click(await screen.findByRole("button", { name: "Edit address" }))

    expect(addressField()).toHaveValue(ADDRESS)
  })

  test("returns a rejected address to its field, with the Lightning hint", async () => {
    renderRefund({
      invoice: paidInvoice(makePayment({ id: "method-ln", lightning: true, name: "BTC (⚡)" })),
      submit: vi.fn<CheckoutRefundPage["submit"]>().mockResolvedValue("rejected"),
    })

    continueWith("lnbc1example")
    fireEvent.click(await screen.findByRole("button", { name: "Submit refund" }))

    expect(
      await screen.findByText(
        "This address can't receive this refund. Check it's a BTC address, not a Lightning invoice.",
      ),
    ).toBeInTheDocument()

    expect(addressField()).toHaveValue("lnbc1example")
  })

  test("keeps the review open after a failed submit, and says so", async () => {
    renderRefund({ submit: vi.fn<CheckoutRefundPage["submit"]>().mockRejectedValue(new Error()) })

    continueWith(ADDRESS)
    fireEvent.click(await screen.findByRole("button", { name: "Submit refund" }))

    expect(
      await screen.findByText("Couldn't submit your refund. Please try again."),
    ).toBeInTheDocument()

    expect(screen.getByRole("button", { name: "Submit refund" })).toBeInTheDocument()
  })

  test("shows a requested refund and where it goes, without implying it was sent", () => {
    renderRefund({
      refund: makeRefund({ payout_id: "payout-1", payout_status: "pending", destination: ADDRESS }),
    })

    expect(refundPage().getByRole("heading", { name: "Refund requested" })).toBeVisible()
    expect(refundPage().getByText(/will send \$100\.00 to this address/u)).toBeInTheDocument()
    expect(refundPage().getByText(ADDRESS.slice(0, 8))).toBeInTheDocument()
    expect(refundPage().queryByText(/sent your refund/u)).not.toBeInTheDocument()
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
  })

  test("links the transaction of a sent refund, without repeating the address", () => {
    renderRefund({
      refund: makeRefund({
        payout_id: "payout-1",
        payout_status: "complete",
        destination: ADDRESS,
        tx_hash: TX_HASH,
        wallet_currency: "btc",
      }),
    })

    expect(refundPage().getByRole("heading", { name: "Refund sent" })).toBeVisible()

    expect(refundPage().getByRole("link", { name: TX_HASH })).toHaveAttribute(
      "href",
      `https://explorer.example.com/tx/${TX_HASH}`,
    )

    expect(refundPage().queryByText(ADDRESS.slice(0, 8))).not.toBeInTheDocument()
  })

  test("points a buyer whose refund failed to the store, without repeating the address", () => {
    renderRefund({
      refund: makeRefund({ payout_id: "payout-1", payout_status: "failed", destination: ADDRESS }),
      store: makeStore({ support_email: "help@example.com" }),
    })

    expect(refundPage().getByRole("heading", { name: "Refund not sent" })).toBeVisible()

    expect(refundPage().getByRole("link", { name: "Contact store" })).toHaveAttribute(
      "href",
      expect.stringMatching(/^mailto:help@example\.com/u),
    )

    expect(refundPage().queryByText(ADDRESS.slice(0, 8))).not.toBeInTheDocument()
  })
})
