import { act, fireEvent, render, screen } from "@testing-library/react"
import { Suspense, type ComponentProps } from "react"
import { describe, expect, test, vi } from "vitest"

import { useCheckout, useCheckoutCountdown } from "../hooks"
import { CheckoutConnectionBanner } from "../parts/connection-banner"
import { createTemplateRegistry } from "../runtime/registry"
import { defineCheckoutTemplate } from "../template"
import { CheckoutTestProviders } from "../testing/checkout-harness"
import { CheckoutPreview } from "./preview"

const PreviewPayment = () => {
  const { payment } = useCheckout("payment")
  const { formatted } = useCheckoutCountdown()

  return (
    <>
      <CheckoutConnectionBanner />

      <p>
        Pay {payment.amount} {payment.name}
      </p>

      <p>Time left {formatted}</p>
    </>
  )
}

const registry = createTemplateRegistry(
  {
    "../templates/receipt/index.ts": () =>
      Promise.resolve({
        default: defineCheckoutTemplate({ name: { id: "Receipt" }, Payment: PreviewPayment }),
      }),
  },
  { defaultId: "receipt" },
)

const preview = (props: Partial<ComponentProps<typeof CheckoutPreview>> = {}) => (
  <CheckoutTestProviders>
    <Suspense fallback={<p>Loading</p>}>
      <CheckoutPreview
        registry={registry}
        templateId="receipt"
        axes={{ status: "new" }}
        {...props}
      />
    </Suspense>
  </CheckoutTestProviders>
)

const renderPreview = async (props: Partial<ComponentProps<typeof CheckoutPreview>> = {}) => {
  let rendered: ReturnType<typeof render> | undefined

  await act(async () => {
    await Promise.resolve()
    rendered = render(preview(props))
  })

  return rendered!
}

describe("CheckoutPreview", () => {
  test("shows the scenario's invoice without any request or live connection", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
    const webSocketSpy = vi.spyOn(globalThis, "WebSocket")

    await renderPreview()

    expect(await screen.findByText("Pay 0.00043210 BTC")).toBeInTheDocument()
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(webSocketSpy).not.toHaveBeenCalled()
  })

  test("continues to payment once the customer saves the requested details", async () => {
    await renderPreview({ axes: { status: "details" } })

    fireEvent.change(screen.getByRole("textbox", { name: /Email/u }), {
      target: { value: "buyer@example.com" },
    })

    fireEvent.change(screen.getByRole("textbox", { name: /Shipping address/u }), {
      target: { value: "Main St 1" },
    })

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Continue to payment" }))
      await Promise.resolve()
    })

    expect(await screen.findByText("Pay 0.00043210 BTC")).toBeInTheDocument()
  })

  test("prices the invoice in the method the preview asks for", async () => {
    await renderPreview({ axes: { status: "new", method: "usdt" } })

    expect(await screen.findByText("Pay 25.000000 USDT")).toBeInTheDocument()
  })

  test("starts the scenario over when the status changes", async () => {
    const { rerender } = await renderPreview({ axes: { status: "details" } })

    fireEvent.change(screen.getByRole("textbox", { name: /Email/u }), {
      target: { value: "buyer@example.com" },
    })

    rerender(preview({ axes: { status: "expired" } }))
    expect(await screen.findByText("Invoice expired")).toBeInTheDocument()

    rerender(preview({ axes: { status: "details" } }))
    expect(await screen.findByRole("textbox", { name: /Email/u })).toHaveValue("")
  })

  test("simulates the expiration the preview asks for, starting over when it changes", async () => {
    const { rerender } = await renderPreview({ expiration: "2h" })

    expect(await screen.findByText("Time left 120:00")).toBeInTheDocument()

    rerender(preview({ expiration: "30s-left" }))
    expect(await screen.findByText("Time left 00:30")).toBeInTheDocument()
  })

  test("speeds the countdown up from the time already left", async () => {
    const { rerender } = await renderPreview({ expiration: "15m" })

    expect(await screen.findByText("Time left 15:00")).toBeInTheDocument()

    vi.useFakeTimers()

    try {
      rerender(preview({ expiration: "15m", speed: "60x" }))

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1_000)
      })

      expect(screen.getByText("Time left 14:00")).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  test("pays in part in place, keeping the clock running", async () => {
    await renderPreview({ expiration: "10m-left" })

    expect(await screen.findByText("Time left 10:00")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Pay in part" }))

    expect(await screen.findByText("Pay 0.00023210 BTC")).toBeInTheDocument()
    expect(screen.getByText("Time left 10:00")).toBeInTheDocument()
    expect(screen.getByText("simulated")).toBeInTheDocument()
  })

  test("lets the invoice expire, with nothing left to happen to it", async () => {
    await renderPreview()

    fireEvent.click(await screen.findByRole("button", { name: "Expire" }))

    expect(await screen.findByText("Invoice expired")).toBeInTheDocument()
    expect(screen.getByText("Nothing else happens to this invoice")).toBeInTheDocument()
  })

  test("drops the live connection and reconnects from the banner", async () => {
    await renderPreview()

    fireEvent.click(await screen.findByRole("button", { name: "gave-up" }))

    expect(
      await screen.findByText("Connection lost: unable to connect to the server."),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Reconnect" }))

    expect(
      screen.queryByText("Connection lost: unable to connect to the server."),
    ).not.toBeInTheDocument()
  })

  test("carries the simulated invoice to its receipt, and refunds it there", async () => {
    const { rerender } = await renderPreview()

    fireEvent.click(await screen.findByRole("button", { name: "Pay in full" }))
    fireEvent.click(await screen.findByRole("button", { name: "Confirm" }))
    expect(await screen.findByText("Payment complete")).toBeInTheDocument()

    rerender(preview({ view: "receipt" }))
    fireEvent.click(await screen.findByRole("button", { name: "Start refund" }))
    expect(await screen.findByText("Awaiting your address")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Submit address" }))
    expect(await screen.findByText("Pending")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Refund fails" }))
    expect(await screen.findByText("Not sent")).toBeInTheDocument()
  })

  test("starts over on reset", async () => {
    await renderPreview()

    fireEvent.click(await screen.findByRole("button", { name: "Pay in part" }))
    expect(await screen.findByText("Pay 0.00023210 BTC")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Reset" }))

    expect(await screen.findByText("Pay 0.00043210 BTC")).toBeInTheDocument()
    expect(screen.queryByText("simulated")).not.toBeInTheDocument()
  })

  test("runs the checkout as a terminal while the preview asks for one", async () => {
    const { rerender, unmount } = await renderPreview({
      axes: { status: "complete" },
      environment: "terminal",
    })

    expect(await screen.findByRole("button", { name: "Print receipt" })).toBeInTheDocument()

    rerender(preview({ axes: { status: "complete" } }))
    expect(await screen.findByRole("link", { name: "View Receipt" })).toBeInTheDocument()

    rerender(preview({ axes: { status: "complete" }, environment: "terminal" }))
    unmount()

    expect(window.BitcartTerminal).toBeUndefined()
  })
})
