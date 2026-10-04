import {
  CHECKOUT_AMOUNT_TESTID,
  CHECKOUT_COUNTDOWN_TESTID,
  CHECKOUT_PAYMENT_ADDRESS_TESTID,
  CHECKOUT_REQUIRED_CONTENT_GUARD_TESTID,
} from "@bitcart/qa"
import { screen, waitFor } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { makeInvoice, makePayment, makeStore } from "../fixtures"
import { useCheckout, useCheckoutCountdown } from "../hooks"
import { CopyField } from "../parts/copy-field"
import { CheckoutFooter } from "../parts/footer"
import { PaymentQr } from "../parts/payment-qr"
import { RecommendedFee } from "../parts/recommended-fee"
import { WalletButton } from "../parts/wallet-button"
import { renderCheckout } from "../testing/render-checkout"
import { ExtensionSlot } from "./slot"

const missingContent = async () => {
  const guard = await screen.findByTestId(
    CHECKOUT_REQUIRED_CONTENT_GUARD_TESTID,
    {},
    { timeout: 2000 },
  )

  await waitFor(() => expect(guard).toHaveAttribute("data-missing"))

  return guard.getAttribute("data-missing")?.split(", ").filter(Boolean)
}

const CompletePayment = () => {
  const { payment } = useCheckout("payment")
  const countdown = useCheckoutCountdown()

  return (
    <>
      <ExtensionSlot name="checkout:header-extra" />

      <p data-testid={CHECKOUT_AMOUNT_TESTID}>
        {payment.amount} {payment.name}
      </p>

      <p data-testid={CHECKOUT_COUNTDOWN_TESTID}>{countdown.formatted}</p>
      <CopyField label="Address" value={payment.address} testId={CHECKOUT_PAYMENT_ADDRESS_TESTID} />
      <PaymentQr />
      <RecommendedFee />
      <WalletButton />
      <ExtensionSlot name="checkout:payment-extra" />
      <CheckoutFooter />
    </>
  )
}

const BarePayment = () => <p>{useCheckout("payment").payment.amount}</p>

describe("RequiredContentGuard", () => {
  test("finds nothing missing on a payment screen that shows everything required", async () => {
    renderCheckout({
      source: {
        invoice: makeInvoice({ payments: [makePayment({ recommended_fee: 3 })] }),
        store: makeStore({ show_recommended_fee: true }),
      },

      screens: { Payment: CompletePayment },
    })

    expect(await missingContent()).toStrictEqual([])
  })

  test("reports every required piece a payment screen leaves out", async () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    renderCheckout({
      templateId: "bare",

      source: {
        invoice: makeInvoice({
          payments: [makePayment({ recommended_fee: 3 }), makePayment({ id: "ltc", name: "LTC" })],
        }),

        store: makeStore({ show_recommended_fee: true }),
      },

      screens: { Payment: BarePayment },
    })

    expect(await missingContent()).toStrictEqual([
      "amount",
      "countdown",
      "payment address",
      "payment URI or QR code",
      "recommended fee",
      "open-wallet action",
      "method selector",
      'slot "checkout:header-extra"',
      'slot "checkout:payment-extra"',
      'slot "checkout:footer-extra"',
    ])

    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('Checkout template "bare" is missing required content'),
    )
  })

  test("asks for an input per requested customer detail", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined)

    renderCheckout({
      source: {
        invoice: makeInvoice({ buyer_email: "", shipping_address: "" }),
        store: makeStore({ email_required: true, ask_address: true }),
      },

      screens: {
        Payment: BarePayment,

        Details: () => (
          <>
            <ExtensionSlot name="checkout:header-extra" />
            <input name="email" aria-label="Email" />
            <CheckoutFooter />
          </>
        ),
      },
    })

    expect(await missingContent()).toStrictEqual([
      'details input "address"',
      'details input "notes"',
    ])
  })

  test("asks for the status once the invoice is settled", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined)

    renderCheckout({
      source: { invoice: makeInvoice({ status: "expired" }) },
      screens: { Payment: BarePayment, Status: () => <CheckoutFooter /> },
    })

    expect(await missingContent()).toStrictEqual([
      "status",
      'slot "checkout:header-extra"',
      'slot "checkout:status-extra"',
    ])
  })
})
