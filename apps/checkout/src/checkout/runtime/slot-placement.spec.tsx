import { describe, expect, test } from "vitest"

import { makeInvoice, makePayment, makeStore } from "../fixtures"
import { renderCheckout } from "../testing/render-checkout"

const placedSlots = () =>
  [...document.querySelectorAll("[data-extension-slot]")].map((marker) =>
    marker.getAttribute("data-extension-slot"),
  )

const twoMethods = [makePayment({ id: "btc" }), makePayment({ id: "ltc", name: "LTC" })]

describe("slot placement in the default screens", () => {
  test.each([
    [
      "customer details",
      { invoice: makeInvoice({ buyer_email: "" }), store: makeStore({ email_required: true }) },
      "preselect",
      ["checkout:header-extra", "checkout:footer-extra"],
    ],
    [
      "method select",
      { invoice: makeInvoice({ payments: twoMethods }) },
      "explicit",
      ["checkout:header-extra", "checkout:footer-extra"],
    ],
    [
      "unavailable",
      { invoice: makeInvoice({ payments: [] }) },
      "preselect",
      ["checkout:header-extra", "checkout:footer-extra"],
    ],
    [
      "confirming",
      { invoice: makeInvoice({ status: "paid" }) },
      "preselect",
      ["checkout:header-extra", "checkout:footer-extra"],
    ],
    [
      "status",
      { invoice: makeInvoice({ status: "expired" }) },
      "preselect",
      ["checkout:header-extra", "checkout:status-extra", "checkout:footer-extra"],
    ],
  ] as const)("the %s screen places its slots", (_screen, source, selection, slots) => {
    renderCheckout({ source, screens: { Payment: () => null, selection } })

    expect(placedSlots()).toStrictEqual(slots)
  })
})
