import { CHECKOUT_AMOUNT_TESTID } from "@bitcart/qa"
import { screen } from "@testing-library/react"
import { describe, expect, onTestFinished, test } from "vitest"

import { makeInvoice, makePayment, makePolicies, makeStore } from "../fixtures"
import { installFakeTerminal } from "../terminal"
import { renderCheckout } from "../testing/render-checkout"
import { PartialPaymentProgress } from "./partial-payment-progress"
import { PaymentQr } from "./payment-qr"
import { PoweredBy } from "./powered-by"
import { RecommendedFee } from "./recommended-fee"
import { SenderAddress } from "./sender-address"
import { WalletButton } from "./wallet-button"

const PaymentParts = () => (
  <>
    <PartialPaymentProgress />
    <PaymentQr />
    <WalletButton />
    <RecommendedFee />
    <PoweredBy />
  </>
)

const paymentUrl = "bitcoin:bc1qparts?amount=0.0015"

describe("payment parts", () => {
  describe("sender address", () => {
    const sender = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"
    const wallet = { network: "eip155:1", sender_address_required: true, links: [] }

    test("shows the only address payments are credited from", () => {
      renderCheckout({
        source: {
          invoice: makeInvoice({ payments: [makePayment({ wallet, user_address: sender })] }),
        },
        screens: { Payment: SenderAddress },
      })

      expect(screen.getByText("Send from")).toBeInTheDocument()

      expect(
        screen.getByText("Payments from other addresses won't be credited."),
      ).toBeInTheDocument()
    })

    test("stays hidden for a method that takes payments from any address", () => {
      const pluginWallet = { ...wallet, sender_address_required: false }

      renderCheckout({
        source: {
          invoice: makeInvoice({
            payments: [makePayment({ wallet: pluginWallet, user_address: "unused" })],
          }),
        },

        screens: { Payment: SenderAddress },
      })

      expect(screen.queryByText("Send from")).not.toBeInTheDocument()
    })
  })

  test("encode the active payment for scanning and wallets", () => {
    renderCheckout({
      source: { invoice: makeInvoice({ payments: [makePayment({ payment_url: paymentUrl })] }) },
      screens: { Payment: PaymentParts },
    })

    expect(screen.getByRole("img", { name: "Payment QR code" })).toBeInTheDocument()

    expect(screen.getByRole("link", { name: "Pay with wallet" })).toHaveAttribute(
      "href",
      paymentUrl,
    )
  })

  test("show the recommended fee only when the store enables it", () => {
    const invoice = makeInvoice({ payments: [makePayment({ recommended_fee: "12" })] })

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

  test.each([
    ["links to Bitcart", false, 1],
    ["names Bitcart without a link on a terminal", true, 0],
  ])("%s", (_case, onTerminal, links) => {
    if (onTerminal) onTestFinished(installFakeTerminal())

    renderCheckout({
      source: { policies: makePolicies({ allow_powered_by_bitcart: true }) },
      screens: { Payment: PoweredBy },
    })

    expect(screen.getByRole("img", { name: "Bitcart" })).toBeInTheDocument()
    expect(screen.queryAllByRole("link", { name: "Powered by Bitcart" })).toHaveLength(links)
  })

  describe("after a partial payment", () => {
    const renderPartial = (transactions: { tx_hash: string; amount: string }[] = []) =>
      renderCheckout({
        source: {
          invoice: makeInvoice({
            payment_id: "method-btc",
            exception_status: "paid_partial",
            sent_amount: "0.00050000",
            transactions,

            payments: [
              makePayment({
                amount: "0.00150000",
                due: "0.00100000",
                due_price: "66.67",
                payment_url: paymentUrl,
              }),
            ],
          }),
        },
        screens: { Payment: PaymentParts },
      })

    test("tell the customer what arrived and what to send now", () => {
      renderPartial()

      expect(screen.getByText("Received")).toBeInTheDocument()
      expect(screen.getByText("0.00050000 BTC")).toBeInTheDocument()
      expect(screen.getByText("Send now")).toBeInTheDocument()
      expect(screen.getByTestId(CHECKOUT_AMOUNT_TESTID)).toHaveTextContent("0.00100000")
    })

    test("count the transfers that arrived when there were several", () => {
      renderPartial([
        { tx_hash: "tx-1", amount: "0.00020000" },
        { tx_hash: "tx-2", amount: "0.00030000" },
      ])

      expect(screen.getByText("2 payments")).toBeInTheDocument()
      expect(screen.getByText("0.00050000 BTC")).toBeInTheDocument()
    })

    test("keep the QR code and the wallet link on the backend's payment URI", () => {
      renderPartial()

      expect(screen.getByRole("img", { name: "Payment QR code" })).toBeInTheDocument()

      expect(screen.getByRole("link", { name: "Pay with wallet" })).toHaveAttribute(
        "href",
        paymentUrl,
      )
    })
  })

  test("show no partial payment progress without a partial payment", () => {
    renderCheckout({ screens: { Payment: PaymentParts } })

    expect(screen.queryByText("Send now")).not.toBeInTheDocument()
  })
})
