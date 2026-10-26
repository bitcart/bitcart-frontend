import { CHECKOUT_AMOUNT_TESTID, CHECKOUT_PAYMENT_ADDRESS_TESTID } from "@bitcart/qa"
import { act, fireEvent, screen } from "@testing-library/react"
import { describe, expect, onTestFinished, test, vi } from "vitest"

import { installFakeTerminal, makeInvoice, makePayment, renderCheckout } from "#/checkout/testing"

import spotlight from "."

const btc = makePayment({ id: "btc", name: "BTC", symbol: "btc", payment_address: "bc1qbtc" })
const ltc = makePayment({ id: "ltc", name: "LTC", symbol: "ltc", payment_address: "ltc1qltc" })

const eth = makePayment({
  id: "eth",
  name: "ETH",
  symbol: "eth",
  payment_address: "0xeth",
  payment_url: "ethereum:0xeth",
})

const renderSpotlight = (payments = [btc, ltc, eth]) =>
  renderCheckout({
    source: { invoice: makeInvoice({ payments }) },
    screens: spotlight,
  })

const searchBox = () => screen.getByRole("combobox")

const press = (key: string) => fireEvent.keyDown(searchBox(), { key })

describe("spotlight template", () => {
  test.each([
    ["focuses the search with a mouse", true],
    ["leaves the on-screen keyboard closed on a touchscreen", false],
  ])("%s", (_case, hasFinePointer) => {
    const matchMedia = window.matchMedia

    vi.spyOn(window, "matchMedia").mockImplementation((query) =>
      Object.assign(matchMedia(query), { matches: query === "(pointer: fine)" && hasFinePointer }),
    )

    renderSpotlight()

    expect(searchBox() === document.activeElement).toBe(hasFinePointer)
  })

  test.each([
    ["the Bitcart wordmark", {}, "Pay Example Store", "Pay Example Store"],
    [
      "a logo spelling the name",
      { logos: { light: "https://example.com/logo.svg" }, useLogoInsteadOfIcon: true },
      "Payment methods",
      "Send exactly",
    ],
  ])("names the store once with %s", (_brand, appearance, listLabel, amountLabel) => {
    renderCheckout({
      source: { invoice: makeInvoice({ payments: [btc, ltc, eth] }), appearance },
      screens: spotlight,
    })

    expect(screen.getByText(listLabel)).toBeInTheDocument()

    fireEvent.click(screen.getByRole("option", { name: /BTC/u }))

    expect(screen.getByText(amountLabel)).toBeInTheDocument()
  })

  test("asks for a currency before showing payment details", () => {
    renderSpotlight()

    expect(screen.getByRole("option", { name: /BTC/u })).toBeInTheDocument()
    expect(screen.queryByText("bc1qbtc")).not.toBeInTheDocument()
  })

  test("narrows the currencies as the customer types", () => {
    renderSpotlight()

    fireEvent.change(searchBox(), { target: { value: "lt" } })

    expect(screen.getAllByRole("option").map((option) => option.textContent)).toStrictEqual([
      expect.stringContaining("LTC"),
    ])
  })

  test("picks the highlighted currency from the keyboard", () => {
    renderSpotlight()

    press("ArrowDown")
    press("ArrowDown")
    press("Enter")

    expect(screen.getByRole("button", { name: "Copy Address" })).toHaveTextContent("0xeth")
  })

  test("keeps a single highlight shared by the keyboard and the pointer", () => {
    renderSpotlight()

    const highlightedOption = () =>
      document.getElementById(searchBox().getAttribute("aria-activedescendant") ?? "")

    press("ArrowDown")

    expect(highlightedOption()).toHaveTextContent("LTC")

    fireEvent.mouseMove(screen.getByRole("option", { name: /ETH/u }))

    expect(highlightedOption()).toHaveTextContent("ETH")
  })

  test("picks a currency with the pointer", () => {
    renderSpotlight()

    fireEvent.click(screen.getByRole("option", { name: /LTC/u }))

    expect(screen.getByRole("button", { name: "Copy Address" })).toHaveTextContent("ltc1qltc")
  })

  test("returns to the search on Escape, and to the previous method on a second Escape", () => {
    renderSpotlight()

    fireEvent.click(screen.getByRole("option", { name: /LTC/u }))
    press("Escape")

    expect(screen.getByRole("option", { name: /ETH/u })).toBeInTheDocument()

    press("Escape")

    expect(screen.getByRole("button", { name: "Copy Address" })).toHaveTextContent("ltc1qltc")
  })

  test("offers to close the modal it's shown in, which the Escapes it handles leave open", () => {
    const close = vi.fn()

    renderCheckout({
      source: { invoice: makeInvoice({ payments: [btc, ltc, eth] }) },
      screens: spotlight,
      appConfig: { close },
    })

    fireEvent.click(screen.getByRole("option", { name: /LTC/u }))

    expect(press("Escape")).toBe(false)

    fireEvent.click(screen.getByRole("button", { name: "Close" }))

    expect(close).toHaveBeenCalledOnce()
  })

  test("clears the search on Escape, and leaves an empty one's Escape to the page", () => {
    renderSpotlight()

    fireEvent.change(searchBox(), { target: { value: "lt" } })

    expect(press("Escape")).toBe(false)
    expect(searchBox()).toHaveValue("")
    expect(screen.getAllByRole("option")).toHaveLength(3)
    expect(press("Escape")).toBe(true)
  })

  test("runs a typed command against the active payment", async () => {
    const writeText = vi.fn(() => Promise.resolve())
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
    renderSpotlight()

    fireEvent.click(screen.getByRole("option", { name: /BTC/u }))
    fireEvent.change(searchBox(), { target: { value: "copy addr" } })

    await act(async () => {
      press("Enter")
      await Promise.resolve()
    })

    expect(writeText).toHaveBeenCalledWith("bc1qbtc")
    expect(await screen.findByText("Address copied")).toBeInTheDocument()
    expect(searchBox()).toHaveValue("")
  })

  test("copies the amount to send as a bare number", async () => {
    const writeText = vi.fn(() => Promise.resolve())
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
    renderSpotlight()

    fireEvent.click(screen.getByRole("option", { name: /BTC/u }))
    fireEvent.change(searchBox(), { target: { value: "copy amount" } })

    await act(async () => {
      press("Enter")
      await Promise.resolve()
    })

    expect(writeText).toHaveBeenCalledWith("0.00150000")
  })

  test("offers no search, wallet link or copy action on a terminal, where the buyer scans the QR code", () => {
    onTestFinished(installFakeTerminal())
    renderSpotlight()

    fireEvent.click(screen.getByRole("option", { name: /ETH/u }))

    expect(screen.getByTestId(CHECKOUT_PAYMENT_ADDRESS_TESTID)).toHaveTextContent("0xeth")
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /^Copy/u })).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Pay with wallet" })).not.toBeInTheDocument()
    expect(screen.queryByText(/Press Esc/u)).not.toBeInTheDocument()
  })

  test("asks for any amount on a zero-price invoice, keeping the rate", () => {
    renderCheckout({
      source: {
        invoice: makeInvoice({
          price: "0.00",
          payments: [btc, ltc].map((payment) => ({ ...payment, amount: "0.00000000" })),
        }),
      },

      screens: spotlight,
    })

    expect(screen.getByRole("option", { name: /BTC/u })).not.toHaveTextContent("0.00000000")

    fireEvent.click(screen.getByRole("option", { name: /BTC/u }))

    expect(screen.getByTestId(CHECKOUT_AMOUNT_TESTID)).toHaveTextContent("Send any amount")
    expect(screen.queryByRole("button", { name: /Copy amount/u })).not.toBeInTheDocument()
    expect(screen.getByText("1 BTC = $66,666.67")).toBeInTheDocument()
  })

  test("offers no currency switch when there is only one", () => {
    renderSpotlight([btc])

    expect(screen.getByRole("button", { name: "Copy Address" })).toHaveTextContent("bc1qbtc")

    fireEvent.change(searchBox(), { target: { value: "switch" } })

    expect(screen.queryByRole("option")).not.toBeInTheDocument()
  })
})
