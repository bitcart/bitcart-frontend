import { CHECKOUT_PREVIEW_STATUSES } from "@bitcart/qa"
import { describe, expect, test } from "vitest"

import { CHECKOUT_PREVIEW_BRAND_IDS } from "#/checkout/preview/brands"

import { getSheetFrames, type SheetSearch } from "./sheet"

const search: SheetSearch = { status: "new", received: "partial", view: "checkout" }

describe("getSheetFrames", () => {
  test("shows each status at its own default received amount", () => {
    const frames = getSheetFrames("status", search)

    expect(frames.map(({ label }) => label)).toStrictEqual([...CHECKOUT_PREVIEW_STATUSES])
    expect(frames.every(({ search: { received } }) => received === undefined)).toBe(true)
  })

  test("offers only the received amounts the status allows", () => {
    const frames = getSheetFrames("received", { ...search, status: "complete" })

    expect(frames.map(({ label }) => label)).toStrictEqual(["full", "full-2", "over"])
  })

  test("shows the Bitcart wordmark, then each brand sample", () => {
    const frames = getSheetFrames("brand", search)

    expect(frames.map(({ search: { brand } }) => brand)).toStrictEqual([
      undefined,
      ...CHECKOUT_PREVIEW_BRAND_IDS,
    ])
  })

  test("keeps the invoice and changes only the width", () => {
    const frames = getSheetFrames("width", search)

    expect(frames.map(({ width }) => width)).toStrictEqual([360, 390, 768, 1024])

    expect(frames.map(({ search: { received } }) => received)).toStrictEqual(
      Array.from({ length: 4 }, () => "partial"),
    )
  })
})
