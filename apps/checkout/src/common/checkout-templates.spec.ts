import { CHECKOUT_PREVIEW_STATUSES, CHECKOUT_REQUIRED_CONTENT_GUARD_TESTID } from "@bitcart/qa"
import { screen, waitFor } from "@testing-library/react"
import { describe, expect, test } from "vitest"

import { CHECKOUT_PREVIEW_SCENARIOS } from "#/checkout/preview/scenarios"
import { makeInvoice, makePayment, renderCheckout } from "#/checkout/testing"

import { checkoutTemplates, DEFAULT_CHECKOUT_TEMPLATE_ID } from "./checkout-templates"

const TEMPLATE_IMPORT_TIMEOUT_MS = 30_000

const placedSlots = () =>
  [...document.querySelectorAll("[data-extension-slot]")].map((marker) =>
    marker.getAttribute("data-extension-slot"),
  )

const twoMethods = [makePayment({ id: "btc" }), makePayment({ id: "ltc", name: "LTC" })]

describe("checkoutTemplates", () => {
  test("registers the default template", () => {
    expect(checkoutTemplates.ids).toContain(DEFAULT_CHECKOUT_TEMPLATE_ID)
  })

  //* The first import of a template transforms its whole module tree, which exceeds the default
  //* timeout when the suite runs in parallel.
  test.each(checkoutTemplates.ids)(
    "loads %s as a checkout template",
    async (id) => {
      await expect(checkoutTemplates.load(id)).resolves.toMatchObject({
        name: { id: expect.any(String) },
        Payment: expect.any(Function),
      })
    },
    TEMPLATE_IMPORT_TIMEOUT_MS,
  )

  describe.each(checkoutTemplates.ids)("the %s template", (id) => {
    //* Vitest stubs catalogs as empty: the test covers the wiring; the build supplies the messages.
    test(
      "ships its source-locale catalog inside its own chunk",
      async () => {
        const { sourceMessages } = await checkoutTemplates.load(id)

        expect(sourceMessages).toBeTypeOf("object")
      },
      TEMPLATE_IMPORT_TIMEOUT_MS,
    )

    const renderTemplate = async (invoice: ReturnType<typeof makeInvoice>) => {
      const template = await checkoutTemplates.load(id)

      renderCheckout({
        templateId: id,
        source: { invoice },
        screens: template,
      })

      return template
    }

    test(
      "places every slot while the customer pays",
      async () => {
        await renderTemplate(makeInvoice({ payments: [makePayment()] }))

        expect(placedSlots()).toStrictEqual([
          "checkout:header-extra",
          "checkout:payment-extra",
          "checkout:footer-extra",
        ])
      },
      TEMPLATE_IMPORT_TIMEOUT_MS,
    )

    test(
      "places every slot while the customer picks a method",
      async () => {
        const { selection } = await renderTemplate(makeInvoice({ payments: twoMethods }))

        expect(placedSlots()).toStrictEqual([
          "checkout:header-extra",
          ...(selection === "preselect" ? ["checkout:payment-extra"] : []),
          "checkout:footer-extra",
        ])
      },
      TEMPLATE_IMPORT_TIMEOUT_MS,
    )

    test(
      "places every slot once the invoice is settled",
      async () => {
        await renderTemplate(makeInvoice({ status: "expired" }))

        expect(placedSlots()).toStrictEqual([
          "checkout:header-extra",
          "checkout:status-extra",
          "checkout:footer-extra",
        ])
      },
      TEMPLATE_IMPORT_TIMEOUT_MS,
    )

    test.each(CHECKOUT_PREVIEW_STATUSES)(
      "shows all required content for the %s preview scenario",
      async (status) => {
        const template = await checkoutTemplates.load(id)

        renderCheckout({
          templateId: id,
          source: CHECKOUT_PREVIEW_SCENARIOS[status],
          screens: template,
        })

        const guard = await screen.findByTestId(CHECKOUT_REQUIRED_CONTENT_GUARD_TESTID)

        await waitFor(() => expect(guard).toHaveAttribute("data-missing"))
        expect(guard.dataset.missing).toBe("")
      },
      TEMPLATE_IMPORT_TIMEOUT_MS,
    )
  })
})
