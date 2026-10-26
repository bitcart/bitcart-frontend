import { fireEvent, screen } from "@testing-library/react"
import { describe, expect, onTestFinished, test, vi } from "vitest"

import { makeInvoice, makePayment } from "../fixtures"
import type { CheckoutAppearance, CheckoutSource } from "../model"
import { installFakeTerminal } from "../terminal"
import { renderCheckout } from "../testing/render-checkout"
import { CheckoutHeader } from "./checkout-header"

const LOGO = "https://example.com/logo.svg"
const ICON = "https://example.com/icon.svg"

const renderHeader = (source: Partial<CheckoutSource> = {}) =>
  renderCheckout({ source, screens: { Payment: CheckoutHeader } })

describe("CheckoutHeader", () => {
  test.each<[string, CheckoutAppearance, boolean, number]>([
    ["the Bitcart wordmark", {}, true, 1],
    ["a logo", { logos: { light: LOGO } }, true, 1],
    ["a logo spelling the name", { logos: { light: LOGO }, useLogoInsteadOfIcon: true }, false, 0],
    ["an icon beside the name", { icons: { light: ICON } }, false, 1],
  ])("shows the store's name once with %s", (_brand, appearance, hasPayLine, nameCount) => {
    renderHeader({ appearance })

    expect(Boolean(screen.queryByText(/^Pay/u))).toBe(hasPayLine)
    expect(screen.queryAllByText("Example Store")).toHaveLength(nameCount)
  })

  test("shows the price and the time left", () => {
    renderHeader()

    expect(screen.getByText("$100")).toBeInTheDocument()

    expect(screen.getByRole("progressbar", { name: "Time left to pay" })).toHaveAttribute(
      "aria-valuetext",
      "15 minutes",
    )
  })

  test.each([
    [900, false],
    [3600, false],
    [7200, true],
  ])("with a lifetime of %i seconds, shows the deadline: %s", (lifetime, isShown) => {
    renderHeader({ invoice: makeInvoice({ expiration_seconds: lifetime, time_left: 600 }) })

    expect(Boolean(screen.queryByText(/^Due by /u))).toBe(isShown)
  })

  test("after a partial payment, tells what is left to pay", () => {
    renderHeader({
      invoice: makeInvoice({
        payment_id: "method-btc",
        exception_status: "paid_partial",
        sent_amount: "0.00050000",
        payments: [makePayment({ due: "0.00100000", due_price: "66.67" })],
      }),
    })

    expect(screen.getByText("left to pay", { exact: false })).toHaveTextContent(
      "$66.67 left to pay",
    )
  })

  test("offers help, except on a terminal", () => {
    const { unmount } = renderHeader()

    expect(screen.getByRole("button", { name: "Help" })).toBeInTheDocument()

    unmount()
    onTestFinished(installFakeTerminal())
    renderHeader()

    expect(screen.queryByRole("button", { name: "Help" })).not.toBeInTheDocument()
  })

  test("offers to close the modal it's shown in, and nothing to close otherwise", () => {
    const close = vi.fn()
    const { unmount } = renderHeader()

    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument()

    unmount()
    renderCheckout({ screens: { Payment: CheckoutHeader }, appConfig: { close } })
    fireEvent.click(screen.getByRole("button", { name: "Close" }))

    expect(close).toHaveBeenCalledOnce()
  })
})
