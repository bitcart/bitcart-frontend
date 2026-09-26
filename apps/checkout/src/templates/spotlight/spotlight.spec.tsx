import { act, fireEvent, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { makeInvoice, makePayment, renderCheckout } from "#/checkout/testing"

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
    options: { selection: spotlight.selection },
    screens: spotlight,
  })

const searchBox = () => screen.getByRole("combobox")

const press = (key: string) => fireEvent.keyDown(searchBox(), { key })

describe("spotlight template", () => {
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

  test("offers no currency switch when there is only one", () => {
    renderSpotlight([btc])

    expect(screen.getByRole("button", { name: "Copy Address" })).toHaveTextContent("bc1qbtc")

    fireEvent.change(searchBox(), { target: { value: "switch" } })

    expect(screen.queryByRole("option")).not.toBeInTheDocument()
  })
})
