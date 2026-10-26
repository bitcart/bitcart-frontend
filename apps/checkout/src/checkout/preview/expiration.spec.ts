import { DisplayInvoice } from "@bitcart/client-sdk/schemas"
import { CHECKOUT_PREVIEW_EXPIRATIONS } from "@bitcart/qa"
import { describe, expect, test } from "vitest"

import { makeInvoice } from "../fixtures"
import { datePreviewInvoice, withPreviewExpiration } from "./expiration"

describe("checkout preview expirations", () => {
  test("leave the scenario's invoice untouched without a preset", () => {
    const invoice = makeInvoice()

    expect(withPreviewExpiration(invoice, undefined)).toBe(invoice)
  })

  test("leave a settled invoice's times untouched", () => {
    const invoice = makeInvoice({ status: "expired", time_left: 0 })

    expect(withPreviewExpiration(invoice, "2h")).toBe(invoice)
  })

  test.each(CHECKOUT_PREVIEW_EXPIRATIONS)("%s is an invoice the API could return", (id) => {
    expect(DisplayInvoice.safeParse(withPreviewExpiration(makeInvoice(), id)).error).toBeUndefined()
  })

  test.each([
    ["5m-left", 900, 300],
    ["2d", 172_800, 172_800],
  ] as const)("%s sets the lifetime to %is with %is left", (id, lifetime, left) => {
    expect(withPreviewExpiration(makeInvoice(), id)).toMatchObject({
      expiration_seconds: lifetime,
      time_left: left,
    })
  })

  test("date a pending invoice so it expires when its time left runs out", () => {
    const now = Date.parse("2026-10-20T12:00:00Z")
    const invoice = makeInvoice({ expiration_seconds: 900, time_left: 600 })

    expect(datePreviewInvoice(invoice, now).created).toBe("2026-10-20T11:55:00.000Z")
  })

  test("leave a settled invoice's date untouched", () => {
    const invoice = makeInvoice({ status: "complete" })

    expect(datePreviewInvoice(invoice, Date.now())).toBe(invoice)
  })
})
