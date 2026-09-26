import { Toaster } from "@bitcart/ui-kit/components"
import { ThemeProvider } from "@bitcart/ui-kit/providers"
import { act, render, renderHook, screen } from "@testing-library/react"
import { describe, expect, test, vi } from "vitest"

import { useCheckoutCopy } from "./copy"

const mockClipboard = (writeText: (text: string) => Promise<void>) => {
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true })
}

const renderCopy = () => {
  render(
    <ThemeProvider>
      <Toaster />
    </ThemeProvider>,
  )

  return renderHook(() => useCheckoutCopy()).result
}

describe("useCheckoutCopy", () => {
  test("copies the value and confirms it with a toast", async () => {
    const writeText = vi.fn(() => Promise.resolve())
    mockClipboard(writeText)
    const copy = renderCopy()

    act(() => copy.current("bc1qaddress", "Address"))

    expect(writeText).toHaveBeenCalledWith("bc1qaddress")
    expect(await screen.findByText("Address copied")).toBeInTheDocument()
  })

  test("confirms a repeat copy made before the copied state resets", async () => {
    mockClipboard(() => Promise.resolve())
    const copy = renderCopy()

    act(() => copy.current("bc1qaddress", "Address"))

    expect(await screen.findByText("Address copied")).toBeInTheDocument()

    act(() => copy.current("bitcoin:bc1qaddress", "Payment URI"))

    expect(await screen.findByText("Payment URI copied")).toBeInTheDocument()
  })

  test("asks for a manual copy when the browser refuses", async () => {
    mockClipboard(() => Promise.reject(new Error("denied")))
    const copy = renderCopy()

    act(() => copy.current("bc1qaddress", "Address"))

    expect(await screen.findByText("Couldn't copy. Please copy it manually.")).toBeInTheDocument()
  })
})
