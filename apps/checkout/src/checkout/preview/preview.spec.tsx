import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { Suspense, type ComponentProps } from "react"
import { describe, expect, test, vi } from "vitest"

import { useCheckout } from "../hooks"
import { createTemplateRegistry } from "../runtime/registry"
import { defineCheckoutTemplate } from "../template"
import { CheckoutTestProviders } from "../testing/checkout-harness"
import { CheckoutPreview } from "./preview"

const PreviewPayment = () => {
  const { payment } = useCheckout("payment")

  return (
    <p>
      Pay {payment.amount} {payment.name}
    </p>
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
  <I18nProvider i18n={i18n}>
    <CheckoutTestProviders>
      <Suspense fallback={<p>Loading</p>}>
        <CheckoutPreview registry={registry} templateId="receipt" status="new" {...props} />
      </Suspense>
    </CheckoutTestProviders>
  </I18nProvider>
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
    await renderPreview({ status: "details" })

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

  test("starts the scenario over when the status changes", async () => {
    const { rerender } = await renderPreview({ status: "details" })

    fireEvent.change(screen.getByRole("textbox", { name: /Email/u }), {
      target: { value: "buyer@example.com" },
    })

    rerender(preview({ status: "expired" }))
    expect(await screen.findByText("Invoice expired")).toBeInTheDocument()

    rerender(preview({ status: "details" }))
    expect(await screen.findByRole("textbox", { name: /Email/u })).toHaveValue("")
  })
})
