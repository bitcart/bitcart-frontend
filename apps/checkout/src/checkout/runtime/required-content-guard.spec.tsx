import {
  CHECKOUT_AMOUNT_TESTID,
  CHECKOUT_COUNTDOWN_TESTID,
  CHECKOUT_PAYMENT_ADDRESS_TESTID,
  CHECKOUT_REQUIRED_CONTENT_GUARD_TESTID,
} from "@bitcart/qa"
import { screen, waitFor } from "@testing-library/react"
import { describe, expect, onTestFinished, test, vi } from "vitest"

import { makeInvoice, makePayment, makeStore } from "../fixtures"
import { useCheckout, useCheckoutCountdown } from "../hooks"
import { AmountBreakdown } from "../parts/amount-breakdown"
import { CheckoutCloseButton } from "../parts/close-button"
import { CheckoutFooter } from "../parts/footer"
import { MethodHint } from "../parts/method-hint"
import { PaymentQr } from "../parts/payment-qr"
import { RecommendedFee } from "../parts/recommended-fee"
import { WalletButton } from "../parts/wallet-button"
import { WalletSentNotice } from "../parts/wallet-sent-notice"
import { installFakeTerminal } from "../terminal"
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

const CompletePayment = ({
  showAmount = (amount: string) => amount,
  walletAction = <WalletButton />,
}) => {
  const { payment, invoice } = useCheckout("payment")
  const countdown = useCheckoutCountdown()

  return (
    <>
      <ExtensionSlot name="checkout:header-extra" />

      <p data-testid={CHECKOUT_AMOUNT_TESTID}>
        {invoice.isAnyAmount ? "Any amount" : showAmount(payment.amount)} {payment.name}
      </p>

      <p data-testid={CHECKOUT_COUNTDOWN_TESTID}>{countdown.formatted}</p>
      <p data-testid={CHECKOUT_PAYMENT_ADDRESS_TESTID}>{payment.address}</p>
      <PaymentQr />
      <RecommendedFee />
      <MethodHint />
      {walletAction}
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
        invoice: makeInvoice({
          payments: [makePayment({ recommended_fee: "3", hint: "Use the Tron network only" })],
        }),

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
          payments: [
            makePayment({ recommended_fee: "3", hint: "Use the Tron network only" }),
            makePayment({ id: "ltc", name: "LTC" }),
          ],
        }),

        store: makeStore({ show_recommended_fee: true }),
      },

      screens: { Payment: BarePayment },
    })

    expect(await missingContent()).toStrictEqual([
      "amount",
      "countdown",
      "payment address",
      "QR code",
      "recommended fee",
      "method hint",
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

  test.each([
    ["without one", CompletePayment, ["close button"]],

    [
      "with one",
      () => (
        <>
          <CompletePayment />
          <CheckoutCloseButton />
        </>
      ),
      [],
    ],
  ])("asks for a close button in a modal, and finds it %s", async (_case, Payment, missing) => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined)
    renderCheckout({ screens: { Payment }, appConfig: { close: vi.fn() } })

    expect(await missingContent()).toStrictEqual(missing)
  })

  test("doesn't ask for the open-wallet action on a terminal", async () => {
    onTestFinished(installFakeTerminal())

    renderCheckout({
      source: { invoice: makeInvoice() },
      screens: { Payment: CompletePayment },
    })

    expect(screen.queryByRole("link", { name: "Pay with wallet" })).not.toBeInTheDocument()
    expect(await missingContent()).toStrictEqual([])
  })

  test("takes a wallet's sent-payment notice in place of the open-wallet action", async () => {
    renderCheckout({
      source: { invoice: makeInvoice() },
      screens: {
        Payment: () => <CompletePayment walletAction={<WalletSentNotice hash="0x1" />} />,
      },
    })

    expect(await missingContent()).toStrictEqual([])
  })

  test("asks for the amount as it's copied, not a reformatted figure", async () => {
    renderCheckout({
      source: { invoice: makeInvoice({ payments: [makePayment({ amount: "0.00150000" })] }) },
      screens: { Payment: () => <CompletePayment showAmount={() => "0.0015"} /> },
    })

    expect(await missingContent()).toStrictEqual(["amount"])
  })

  test("accepts any text as the amount of an invoice that accepts any amount", async () => {
    renderCheckout({
      source: {
        invoice: makeInvoice({ price: "0.00", payments: [makePayment({ amount: "0.00000000" })] }),
      },

      screens: { Payment: CompletePayment },
    })

    expect(await missingContent()).toStrictEqual([])
  })

  test.each([
    [
      "a discount",
      { effective_price: "90", applied_discount: { name: "Autumn sale", percent: 10 } },
    ],
    ["a network cost", { amount: "0.00151000", network_fee: "0.00001000" }],
  ])("asks for the amount breakdown with %s", async (_case, payment) => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined)

    renderCheckout({
      source: { invoice: makeInvoice({ payments: [makePayment(payment)] }) },
      screens: { Payment: CompletePayment },
    })

    expect(await missingContent()).toStrictEqual(["amount breakdown"])
  })

  test("finds the amount breakdown it asks for", async () => {
    renderCheckout({
      source: {
        invoice: makeInvoice({
          payments: [makePayment({ amount: "0.00151000", network_fee: "0.00001000" })],
        }),
      },

      screens: {
        Payment: () => (
          <>
            <CompletePayment />
            <AmountBreakdown />
          </>
        ),
      },
    })

    expect(await missingContent()).toStrictEqual([])
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

  describe("sender address", () => {
    const eth = makePayment({
      wallet: { network: "eip155:1", sender_address_required: true, links: [] },
    })

    test("asks for the address input and the address slot", async () => {
      vi.spyOn(console, "warn").mockImplementation(() => undefined)

      renderCheckout({
        source: { invoice: makeInvoice({ payments: [eth] }) },

        screens: {
          Payment: BarePayment,

          Address: () => (
            <>
              <ExtensionSlot name="checkout:header-extra" />
              <CheckoutFooter />
            </>
          ),
        },
      })

      expect(await missingContent()).toStrictEqual([
        "sender address input",
        'slot "checkout:address-extra"',
      ])
    })

    test("asks a payment screen to show the address payments must come from", async () => {
      vi.spyOn(console, "warn").mockImplementation(() => undefined)

      renderCheckout({
        source: {
          invoice: makeInvoice({ payments: [{ ...eth, user_address: "0xsender" }] }),
        },

        screens: { Payment: CompletePayment },
      })

      expect(await missingContent()).toContain("sender address")
    })
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
