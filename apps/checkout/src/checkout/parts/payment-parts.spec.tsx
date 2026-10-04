import { screen } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { makeInvoice, makePayment, makePolicies, makeStore } from "../fixtures"
import { renderCheckout } from "../testing/render-checkout"
import { PartialPaymentNotice } from "./partial-payment-notice"
import { PaymentQr } from "./payment-qr"
import { PoweredBy } from "./powered-by"
import { RecommendedFee } from "./recommended-fee"
import { WalletButton } from "./wallet-button"

const PaymentParts = () => (
  <>
    <PartialPaymentNotice />
    <PaymentQr />
    <WalletButton />
    <RecommendedFee />
    <PoweredBy />
  </>
)

const paymentUrl = "bitcoin:bc1qparts?amount=0.0015"

describe("payment parts", () => {
  test("encode the active payment for scanning and wallets", () => {
    renderCheckout({
      source: { invoice: makeInvoice({ payments: [makePayment({ payment_url: paymentUrl })] }) },
      screens: { Payment: PaymentParts },
    })

    expect(screen.getByRole("img", { name: "Payment QR code" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Open in Wallet" })).toHaveAttribute("href", paymentUrl)
  })

  test("show the recommended fee only when the store enables it", () => {
    const invoice = makeInvoice({ payments: [makePayment({ recommended_fee: 12 })] })

    const { unmount } = renderCheckout({
      source: { invoice, store: makeStore({ show_recommended_fee: true }) },
      screens: { Payment: PaymentParts },
    })

    expect(screen.getByText("Recommended fee: 12 sat/byte")).toBeInTheDocument()

    unmount()

    renderCheckout({
      source: { invoice, store: makeStore({ show_recommended_fee: false }) },
      screens: { Payment: PaymentParts },
    })

    expect(screen.queryByText(/Recommended fee/u)).not.toBeInTheDocument()
  })

  test.each([true, false])("show the powered-by badge when the policy is %s", (allowed) => {
    renderCheckout({
      source: { policies: makePolicies({ allow_powered_by_bitcart: allowed }) },
      screens: { Payment: PaymentParts },
    })

    expect(Boolean(screen.queryByText(/Powered by/u))).toBe(allowed)
  })

  describe("after a partial payment", () => {
    const renderPartial = () =>
      renderCheckout({
        source: {
          invoice: makeInvoice({
            payment_id: "method-btc",
            exception_status: "paid_partial",
            sent_amount: 0.0005,
            payments: [makePayment({ amount: "0.00150000", payment_url: paymentUrl })],
          }),
        },
        screens: { Payment: PaymentParts },
      })

    test("tell the customer what arrived and what is still due", () => {
      renderPartial()

      expect(screen.getByRole("status")).toHaveTextContent(
        "Received 0.00050000 of 0.00150000 BTC. Please send the remaining 0.00100000 BTC.",
      )
    })

    test("encode only the address, with no wallet link for the full amount", () => {
      renderPartial()

      expect(screen.getByRole("img", { name: "Payment QR code" })).toBeInTheDocument()
      expect(screen.queryByRole("link", { name: "Open in Wallet" })).not.toBeInTheDocument()
    })
  })

  test("show no partial payment notice without a partial payment", () => {
    renderCheckout({ screens: { Payment: PaymentParts } })

    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })
})
