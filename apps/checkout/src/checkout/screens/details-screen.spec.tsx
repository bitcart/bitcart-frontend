import { act, fireEvent, screen, waitFor } from "@testing-library/react"
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

const typeEmail = (value: string) =>
  fireEvent.change(screen.getByRole("textbox", { name: /Email/u }), { target: { value } })

const rejection = Object.assign(new Error("Unprocessable Entity"), {
  status: 422,

  info: {
    detail: [
      {
        loc: ["body", "buyer_email", "function-after[_validate(), str]"],
        msg: "value is not a valid email address: An email address cannot end with a period.",
        type: "value_error",
      },
      {
        loc: ["body", "buyer_email", "literal['']"],
        msg: "Input should be ''",
        type: "literal_error",
      },
    ],
  },
})

const submit = async () => {
  const button = screen.getByRole("button", { name: "Continue to payment" })

  await act(async () => {
    fireEvent.click(button)
    await Promise.resolve()
  })

  await waitFor(() => expect(button).not.toHaveAttribute("aria-busy", "true"))
}

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

  test("explains a failed save without the API's wording", async () => {
    renderDetails(
      { email_required: true, ask_address: false },
      vi.fn(() => Promise.reject(new Error("Network down"))),
    )

    typeEmail("buyer@example.com")
    await submit()

    expect(screen.getByText("Couldn't save your details. Please try again.")).toBeInTheDocument()

    typeEmail("buyer@example.org")

    expect(
      screen.queryByText("Couldn't save your details. Please try again."),
    ).not.toBeInTheDocument()
  })

  test("marks the email the API rejects, in plain words, until it's edited", async () => {
    renderDetails(
      { email_required: true, ask_address: false },
      vi.fn(() => Promise.reject(rejection)),
    )

    typeEmail("dw@example.")
    await submit()

    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument()
    expect(screen.queryByText(/function-after/u)).not.toBeInTheDocument()

    typeEmail("dw@example.com")

    expect(screen.queryByText("Enter a valid email address.")).not.toBeInTheDocument()
  })
})
