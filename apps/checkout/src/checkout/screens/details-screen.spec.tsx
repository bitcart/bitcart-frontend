import { act, fireEvent, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { makeInvoice, makeStore, renderCheckout } from "../testing"

const PaymentScreen = () => <p>Payment details</p>

const renderDetails = (
  settings = { email_required: true, ask_address: false },
  submitCustomerDetails = vi.fn(() => Promise.resolve()),
) => {
  renderCheckout({
    source: {
      invoice: makeInvoice({ buyer_email: "", shipping_address: "" }),
      store: makeStore(settings),
      submitCustomerDetails,
    },
    screens: { Payment: PaymentScreen },
  })

  return { submitCustomerDetails }
}

const submit = () =>
  act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }))
    await Promise.resolve()
  })

describe("customer details screen", () => {
  test("asks for the email before any payment details", () => {
    renderDetails()

    expect(screen.getByRole("textbox", { name: /Email/u })).toBeInTheDocument()
    expect(screen.queryByRole("textbox", { name: /Shipping address/u })).not.toBeInTheDocument()
    expect(screen.queryByText("Payment details")).not.toBeInTheDocument()
  })

  test("rejects an invalid email without saving it", async () => {
    const { submitCustomerDetails } = renderDetails()

    fireEvent.change(screen.getByRole("textbox", { name: /Email/u }), {
      target: { value: "not-an-email" },
    })

    await submit()

    expect(screen.getByRole("textbox", { name: /Email/u })).toHaveAttribute("aria-invalid", "true")
    expect(submitCustomerDetails).not.toHaveBeenCalled()
  })

  test("flags an untouched required email without saving it", async () => {
    const { submitCustomerDetails } = renderDetails()

    await submit()

    expect(screen.getByRole("textbox", { name: /Email/u })).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByRole("textbox", { name: /Email/u })).toHaveFocus()
    expect(submitCustomerDetails).not.toHaveBeenCalled()
  })

  test.each(["üser@example.com", "a&b@example.com"])(
    "accepts the email %j that the API accepts",
    async (email) => {
      const { submitCustomerDetails } = renderDetails()

      fireEvent.change(screen.getByRole("textbox", { name: /Email/u }), {
        target: { value: email },
      })

      await submit()

      expect(submitCustomerDetails).toHaveBeenCalledWith({ buyer_email: email })
    },
  )

  test("saves the requested details", async () => {
    const { submitCustomerDetails } = renderDetails({ email_required: true, ask_address: true })

    fireEvent.change(screen.getByRole("textbox", { name: /Email/u }), {
      target: { value: "buyer@example.com" },
    })

    fireEvent.change(screen.getByRole("textbox", { name: /Shipping address/u }), {
      target: { value: "Main St 1" },
    })

    await submit()

    expect(submitCustomerDetails).toHaveBeenCalledWith({
      buyer_email: "buyer@example.com",
      shipping_address: "Main St 1",
      notes: "",
    })
  })

  test("saves the shipping address without the optional notes", async () => {
    const { submitCustomerDetails } = renderDetails({ email_required: false, ask_address: true })

    fireEvent.change(screen.getByRole("textbox", { name: /Shipping address/u }), {
      target: { value: "Main St 1" },
    })

    await submit()

    expect(submitCustomerDetails).toHaveBeenCalledWith({ shipping_address: "Main St 1", notes: "" })
  })

  test("saves notes left with the shipping address", async () => {
    const { submitCustomerDetails } = renderDetails({ email_required: false, ask_address: true })

    fireEvent.change(screen.getByRole("textbox", { name: /Shipping address/u }), {
      target: { value: "Main St 1" },
    })

    fireEvent.change(screen.getByRole("textbox", { name: /Notes/u }), {
      target: { value: "Ring twice" },
    })

    await submit()

    expect(submitCustomerDetails).toHaveBeenCalledWith({
      shipping_address: "Main St 1",
      notes: "Ring twice",
    })
  })

  test("explains why the details could not be saved", async () => {
    renderDetails(
      { email_required: true, ask_address: false },
      vi.fn(() => Promise.reject(new Error("Network down"))),
    )

    fireEvent.change(screen.getByRole("textbox", { name: /Email/u }), {
      target: { value: "buyer@example.com" },
    })

    await submit()

    expect(screen.getByText("Request failed")).toBeInTheDocument()
  })
})
