import type { CheckoutPreviewAxes } from "@bitcart/qa"
import { describe, expect, test } from "vitest"

import { normalizePreviewAxes } from "./axes"
import { getPreviewActions } from "./simulation"

const actions = (axes: CheckoutPreviewAxes) =>
  getPreviewActions(normalizePreviewAxes(axes)).map(({ label, next }) => [
    label,
    next.status,
    next.received,
  ])

describe("getPreviewActions", () => {
  test("pays a new invoice in part, in full or over, or lets it expire", () => {
    expect(actions({ status: "new" })).toStrictEqual([
      ["Pay in part", "new", "partial"],
      ["Pay in full", "paid", "full"],
      ["Overpay", "paid", "over"],
      ["Expire", "expired", "none"],
    ])
  })

  test("pays in part again, or the rest, after a partial payment", () => {
    expect(actions({ status: "new", received: "partial" })).toStrictEqual([
      ["Pay in part again", "new", "partial-2"],
      ["Pay the rest", "paid", "full-2"],
      ["Expire", "expired", "partial"],
    ])
  })

  test("pays an invoice that asked for the customer's details, keeping its status", () => {
    expect(actions({ status: "details" })[0]).toStrictEqual(["Pay in part", "details", "partial"])
  })

  test("offers only what a Lightning invoice can do", () => {
    expect(actions({ status: "new", method: "lightning" })).toStrictEqual([
      ["Pay in full", "paid", "full"],
      ["Expire", "expired", "none"],
    ])
  })

  test("confirms a paid invoice, or drops its payment", () => {
    expect(actions({ status: "paid" })).toStrictEqual([
      ["Confirm", "complete", "full"],
      ["Drop from mempool", "invalid", "full"],
    ])
  })

  test("refunds a complete invoice in three steps", () => {
    expect(actions({ status: "complete" })).toStrictEqual([
      ["Start refund", "refund-unclaimed", "full"],
    ])

    expect(actions({ status: "refund-unclaimed" })).toStrictEqual([
      ["Submit address", "refund-pending", "full"],
    ])

    expect(actions({ status: "refund-pending" })).toStrictEqual([
      ["Send refund", "refunded", "full"],
      ["Refund fails", "refund-failed", "full"],
    ])
  })

  test.each(["expired", "invalid", "refunded", "refund-failed", "unknown", "unavailable"] as const)(
    "has nothing left to do once %s",
    (status) => {
      expect(actions({ status })).toStrictEqual([])
    },
  )
})
