import { act, fireEvent, screen, waitFor } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import type { CheckoutSenderAddressOutcome, CheckoutSource } from "../model"
import { makeInvoice, makePayment, makePolicies, renderCheckout } from "../testing"

const SENDER = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"

const eth = makePayment({
  id: "method-eth",
  name: "ETH",
  symbol: "eth",
  payment_address: "0xmerchant",
  wallet: { network: "eip155:1", sender_address_required: true, links: [] },
})

const PaymentScreen = () => <p>Payment details</p>

const renderAddress = ({
  submitSenderAddress = vi.fn(() => Promise.resolve<CheckoutSenderAddressOutcome>("accepted")),
  policies = makePolicies(),
}: Partial<Pick<CheckoutSource, "submitSenderAddress" | "policies">> = {}) => {
  renderCheckout({
    source: { invoice: makeInvoice({ payments: [eth] }), policies, submitSenderAddress },
    screens: { Payment: PaymentScreen },
  })

  return { submitSenderAddress }
}

const field = () => screen.getByRole("textbox", { name: /Your ETH address/u })

const submit = async () => {
  const button = screen.getByRole("button", { name: "Continue to payment" })

  await act(async () => {
    fireEvent.click(button)
    await Promise.resolve()
  })

  await waitFor(() => expect(button).not.toHaveAttribute("aria-busy", "true"))
}

const enterAndSubmit = async (address: string) => {
  fireEvent.change(field(), { target: { value: address } })
  await submit()
}

describe("sender address screen", () => {
  test("asks for the address before any payment details", () => {
    renderAddress()

    expect(field()).toBeInTheDocument()
    expect(screen.queryByText("Payment details")).not.toBeInTheDocument()
  })

  test("flags an empty address without saving it", async () => {
    const { submitSenderAddress } = renderAddress()

    await submit()

    expect(field()).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByText("Enter your address.")).toBeInTheDocument()
    expect(submitSenderAddress).not.toHaveBeenCalled()
  })

  test("saves the trimmed address for the selected method", async () => {
    const { submitSenderAddress } = renderAddress()

    await enterAndSubmit(`  ${SENDER} `)

    expect(submitSenderAddress).toHaveBeenCalledWith("method-eth", SENDER)
  })

  test("puts a rejected address's error on the field", async () => {
    renderAddress({ submitSenderAddress: () => Promise.resolve("rejected") })

    await enterAndSubmit("0xnot-an-address")

    expect(field()).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByText("This isn't a valid ETH address.")).toBeInTheDocument()
  })

  test("reports a failed save without blaming the address", async () => {
    renderAddress({ submitSenderAddress: () => Promise.reject(new Error("Bad Gateway")) })

    await enterAndSubmit(SENDER)

    expect(screen.getByText("Couldn't save your address. Please try again.")).toBeInTheDocument()
    expect(field()).not.toHaveAttribute("aria-invalid", "true")
  })

  describe("ETH plugin offer", () => {
    test("opens in place of the form and returns to it with the address kept", () => {
      renderAddress()

      fireEvent.change(field(), { target: { value: SENDER } })
      fireEvent.click(screen.getByRole("button", { name: "Skip" }))

      expect(screen.getByRole("heading", { name: "For server owners" })).toHaveFocus()
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument()

      expect(screen.getByRole("link", { name: "Buy plugin" })).toHaveAttribute(
        "href",
        "https://admin.example.com/plugins?plugin_id=ZIDVfTVxDWQLKyhYiqifyNkhcvfufUKm&action=buy",
      )

      fireEvent.click(screen.getByRole("button", { name: "Back" }))

      expect(field()).toHaveFocus()
      expect(field()).toHaveValue(SENDER)
    })

    test("can't be opened when the server hides it", () => {
      renderAddress({ policies: makePolicies({ allow_eth_plugin_info: false }) })

      expect(screen.queryByRole("button", { name: "Skip" })).not.toBeInTheDocument()
    })
  })
})
