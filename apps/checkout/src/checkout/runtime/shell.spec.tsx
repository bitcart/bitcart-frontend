import { fireEvent, screen } from "@testing-library/react"
import { useEffect, useRef } from "react"
import { describe, expect, test, vi } from "vitest"

import { makeInvoice, makePayment, makePolicies, makeStore } from "../fixtures"
import { useCheckout } from "../hooks"
import { renderCheckout } from "../testing/render-checkout"

const PaymentScreen = () => {
  const { payment } = useCheckout("payment")

  return <p>Pay to {payment.address}</p>
}

describe("CheckoutShell", () => {
  test("renders the payment screen while the invoice awaits payment", () => {
    renderCheckout({ screens: { Payment: PaymentScreen } })

    expect(screen.getByText("Pay to bc1qexampleaddress")).toBeInTheDocument()
  })

  describe("status", () => {
    test("renders the template's own status screen", () => {
      const StatusScreen = () => <p>Status: {useCheckout("status").status}</p>

      renderCheckout({
        source: { invoice: makeInvoice({ status: "expired" }) },
        screens: { Payment: PaymentScreen, Status: StatusScreen },
      })

      expect(screen.getByText("Status: expired")).toBeInTheDocument()
    })

    test("falls back to the shared status screen", () => {
      renderCheckout({
        source: { invoice: makeInvoice({ status: "expired" }) },
        screens: { Payment: PaymentScreen },
      })

      expect(screen.getByText("Invoice expired")).toBeInTheDocument()
    })
  })

  test("explains that no payment methods are available", () => {
    renderCheckout({
      source: { invoice: makeInvoice({ payments: [] }) },
      screens: { Payment: PaymentScreen },
    })

    expect(
      screen.getByText("No payment methods are available for this invoice"),
    ).toBeInTheDocument()
  })

  describe("select", () => {
    const payments = [
      makePayment({ id: "method-btc", name: "BTC", payment_address: "bc1qbtc" }),
      makePayment({ id: "method-ltc", name: "LTC", payment_address: "ltc1qltc" }),
    ]

    test("lets the customer pick a method from the shared list", () => {
      renderCheckout({
        source: { invoice: makeInvoice({ payments }) },
        screens: { Payment: PaymentScreen, selection: "explicit" },
      })

      fireEvent.click(screen.getByRole("button", { name: /LTC/u }))

      expect(screen.getByText("Pay to ltc1qltc")).toBeInTheDocument()
    })

    test("renders the template's own method picker", () => {
      const SelectScreen = () => <p>{useCheckout("select").methods.length} methods to pick from</p>

      renderCheckout({
        source: { invoice: makeInvoice({ payments }) },
        screens: { Payment: PaymentScreen, Select: SelectScreen, selection: "explicit" },
      })

      expect(screen.getByText("2 methods to pick from")).toBeInTheDocument()
    })

    test("moves focus to the payment view once a method is picked", () => {
      renderCheckout({
        source: { invoice: makeInvoice({ payments }) },
        screens: { Payment: PaymentScreen, selection: "explicit" },
      })

      fireEvent.click(screen.getByRole("button", { name: /LTC/u }))

      expect(screen.getByText("Pay to ltc1qltc")).toHaveFocus()
    })

    test("leaves focus where the new view put it", () => {
      const FocusingPayment = () => {
        const searchRef = useRef<HTMLInputElement>(null)

        useEffect(() => searchRef.current?.focus(), [])

        return (
          <div>
            <p>Pay</p>
            <input ref={searchRef} aria-label="Search" />
          </div>
        )
      }

      renderCheckout({
        source: { invoice: makeInvoice({ payments }) },
        screens: { Payment: FocusingPayment, selection: "explicit" },
      })

      fireEvent.click(screen.getByRole("button", { name: /LTC/u }))

      expect(screen.getByRole("textbox", { name: "Search" })).toHaveFocus()
    })
  })

  test("renders the template's own customer details screen", () => {
    const DetailsScreen = () => <p>Asking for {useCheckout("details").details.fields.join(", ")}</p>

    renderCheckout({
      source: {
        invoice: makeInvoice({ buyer_email: "", shipping_address: "" }),
        store: makeStore({ email_required: true, ask_address: true }),
      },
      screens: { Payment: PaymentScreen, Details: DetailsScreen },
    })

    expect(screen.getByText("Asking for email, address, notes")).toBeInTheDocument()
  })

  describe("address", () => {
    const eth = makePayment({
      id: "method-eth",
      name: "ETH",
      wallet: { network: "eip155:1", sender_address_required: true, links: [] },
    })

    test("renders the template's own sender address screen", () => {
      const AddressScreen = () => <p>Address for {useCheckout("address").method.name}</p>

      renderCheckout({
        source: { invoice: makeInvoice({ payments: [eth] }) },
        screens: { Payment: PaymentScreen, Address: AddressScreen },
      })

      expect(screen.getByText("Address for ETH")).toBeInTheDocument()
    })

    test("moves focus to the address view once a method is picked", () => {
      const AddressScreen = () => <p>Address for {useCheckout("address").method.name}</p>

      renderCheckout({
        source: { invoice: makeInvoice({ payments: [makePayment({ name: "BTC" }), eth] }) },
        screens: { Payment: PaymentScreen, Address: AddressScreen, selection: "explicit" },
      })

      fireEvent.click(screen.getByRole("button", { name: /ETH/u }))

      expect(screen.getByText("Address for ETH")).toHaveFocus()
    })
  })

  describe("confirming", () => {
    const paidInvoice = makeInvoice({
      status: "paid",
      payment_id: "method-btc",
      payments: [makePayment({ confirmations: 1 })],
    })

    test("tells the customer the payment arrived and is confirming", () => {
      renderCheckout({
        source: { invoice: paidInvoice, store: makeStore({ transaction_speed: 3 }) },
        screens: { Payment: PaymentScreen },
      })

      expect(screen.getByText("Payment received")).toBeInTheDocument()
      expect(screen.getByText("Waiting for confirmations: 1 of 3")).toBeInTheDocument()
      expect(screen.queryByText(/Pay to/u)).not.toBeInTheDocument()
    })

    test("lets the customer return to the store while the payment confirms", () => {
      const redirect = vi.fn()

      renderCheckout({
        source: { invoice: { ...paidInvoice, redirect_url: "https://shop.example.com/thanks" } },
        screens: { Payment: PaymentScreen },
        appConfig: { redirect },
      })

      fireEvent.click(screen.getByRole("button", { name: "Return to Store" }))

      expect(redirect).toHaveBeenCalledExactlyOnceWith("https://shop.example.com/thanks")
    })

    test("renders the template's own confirming screen", () => {
      const ConfirmingScreen = () => <p>Confirming {useCheckout("confirming").status}</p>

      renderCheckout({
        source: { invoice: paidInvoice },
        screens: { Payment: PaymentScreen, Confirming: ConfirmingScreen },
      })

      expect(screen.getByText("Confirming paid")).toBeInTheDocument()
    })
  })

  describe("partial payment arriving", () => {
    const method = makePayment({ id: "method-btc", amount: "0.00150000" })

    const partiallyPaid = (sentAmount: string, due: string) =>
      makeInvoice({
        payments: [{ ...method, due }],
        payment_id: "method-btc",
        exception_status: "paid_partial",
        sent_amount: sentAmount,
      })

    test("announces the payment and what is still due", async () => {
      const { refetch } = renderCheckout({
        source: { invoice: makeInvoice({ payments: [method] }) },
        screens: { Payment: PaymentScreen },
      })

      refetch({ invoice: partiallyPaid("0.00050000", "0.00100000") })

      expect(
        await screen.findByText(
          "Partial payment received. Please send the remaining 0.00100000 BTC.",
        ),
      ).toBeInTheDocument()
    })

    test("announces every further partial payment", async () => {
      const { refetch } = renderCheckout({
        source: { invoice: partiallyPaid("0.00050000", "0.00100000") },
        screens: { Payment: PaymentScreen },
      })

      refetch({ invoice: partiallyPaid("0.00100000", "0.00050000") })

      expect(
        await screen.findByText(
          "Partial payment received. Please send the remaining 0.00050000 BTC.",
        ),
      ).toBeInTheDocument()
    })

    test("doesn't announce when the page opens on an already partially paid invoice", async () => {
      renderCheckout({
        source: { invoice: partiallyPaid("0.00050000", "0.00100000") },
        screens: { Payment: PaymentScreen },
      })

      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(screen.queryByText(/Partial payment received/u)).not.toBeInTheDocument()
    })
  })

  describe("shared screens", () => {
    const twoMethods = [makePayment({ id: "btc" }), makePayment({ id: "ltc", name: "LTC" })]

    test.each([
      [
        "customer details",
        { invoice: makeInvoice({ buyer_email: "" }), store: makeStore({ email_required: true }) },
        "preselect",
      ],
      ["method select", { invoice: makeInvoice({ payments: twoMethods }) }, "explicit"],
      ["unavailable", { invoice: makeInvoice({ payments: [] }) }, "preselect"],
      ["status", { invoice: makeInvoice({ status: "expired" }) }, "preselect"],
      ["confirming", { invoice: makeInvoice({ status: "paid" }) }, "preselect"],
    ] as const)(
      "the %s screen renders the app controls and branding",
      (_screen, source, selection) => {
        renderCheckout({
          source: { ...source, policies: makePolicies({ allow_powered_by_bitcart: true }) },
          screens: { Payment: PaymentScreen, selection },
          appConfig: { controls: <button type="button">Language</button> },
        })

        expect(screen.getByRole("button", { name: "Language" })).toBeInTheDocument()
        expect(screen.getByText(/Powered by/u)).toBeInTheDocument()
      },
    )
  })
})
