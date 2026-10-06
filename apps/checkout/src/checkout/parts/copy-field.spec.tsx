import { act, fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { CheckoutTestProviders } from "../testing"
import { CopyField } from "./copy-field"

describe("CopyField", () => {
  test("copies its value and confirms it", async () => {
    const writeText = vi.fn(() => Promise.resolve())
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })

    render(<CopyField label="Address" value="bc1qaddress" />, { wrapper: CheckoutTestProviders })

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Address/u }))
      await Promise.resolve()
    })

    expect(writeText).toHaveBeenCalledWith("bc1qaddress")
    expect(screen.getByRole("button", { name: /Address/u })).toHaveTextContent("Copied!")
  })

  test("offers the full value for a manual copy when the browser refuses", async () => {
    const address = "bc1qaverylongaddressthatwouldbetruncatedinsidethebutton"
    const writeText = vi.fn(() => Promise.reject(new Error("denied")))
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })

    render(<CopyField label="Address" value={address} />, { wrapper: CheckoutTestProviders })

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Address/u }))
      await Promise.resolve()
    })

    expect(
      screen.getByText("Couldn't copy. Select the text below and copy it manually."),
    ).toBeInTheDocument()

    expect(screen.getByRole("textbox", { name: "Address" })).toHaveValue(address)
  })
})
