import { act, render, screen } from "@testing-library/react"
import { Suspense } from "react"
import { describe, expect, test, vi } from "vitest"

import { useCheckout } from "../hooks"
import { defineCheckoutTemplate, type CheckoutTemplateDefinition } from "../template"
import { makeInvoice, makePayment, makeSource } from "../testing/fixtures"
import { createTemplateRegistry } from "./registry"
import { CheckoutView } from "./view"

const templateModule = (definition: Omit<CheckoutTemplateDefinition, "name">) => () =>
  Promise.resolve({ default: defineCheckoutTemplate({ name: { id: "Test" }, ...definition }) })

const registry = createTemplateRegistry(
  {
    "../templates/accordion/index.ts": templateModule({
      Payment: () => <p>Accordion pays {useCheckout("payment").payment.name}</p>,
    }),

    "../templates/broken/index.ts": templateModule({
      Payment: () => {
        throw new Error("Broken template")
      },
    }),

    "../templates/spotlight/index.ts": templateModule({
      selection: "explicit",
      Payment: () => <p>Spotlight pays {useCheckout("payment").payment.name}</p>,
    }),
  },
  { defaultId: "accordion" },
)

//* An async act lets the lazily loaded template resolve before assertions run.
const renderView = (templateId: string) =>
  act(async () => {
    await Promise.resolve()

    render(
      <Suspense fallback={<p>Loading</p>}>
        <CheckoutView
          source={makeSource({
            invoice: makeInvoice({
              payments: [
                makePayment({ id: "btc", name: "BTC" }),
                makePayment({ id: "ltc", name: "LTC" }),
              ],
            }),
          })}
          connection={null}
          registry={registry}
          templateId={templateId}
        />
      </Suspense>,
    )
  })

describe("CheckoutView", () => {
  test("renders the requested template", async () => {
    await renderView("accordion")

    expect(await screen.findByText("Accordion pays BTC")).toBeInTheDocument()
  })

  test("applies the template's selection mode", async () => {
    await renderView("spotlight")

    expect(screen.getByText("Choose a payment method")).toBeInTheDocument()
  })

  test("falls back to the default template when the template crashes", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)

    await renderView("broken")

    expect(screen.getByText("Accordion pays BTC")).toBeInTheDocument()
  })
})
