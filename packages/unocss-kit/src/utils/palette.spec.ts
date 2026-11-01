import { describe, expect, test } from "vitest"

import type { ThemeColorPaletteOverrides } from "#/types"

import { withPrimaryTextFallback } from "./palette"

describe("withPrimaryTextFallback", () => {
  test("copies `primary` into `primary-text` when a layer recolors `primary` alone", () => {
    expect(withPrimaryTextFallback({ primary: "0.5 0.1 240" })).toEqual({
      primary: "0.5 0.1 240",
      "primary-text": "0.5 0.1 240",
    })
  })

  test("keeps an explicit `primary-text`", () => {
    const palette: ThemeColorPaletteOverrides = {
      primary: "0.5 0.1 240",
      "primary-text": "0.7 0.1 240",
    }

    expect(withPrimaryTextFallback(palette)).toEqual(palette)
  })

  test("leaves layers without `primary` untouched", () => {
    expect(withPrimaryTextFallback({ background: "1 0 0" })).toEqual({ background: "1 0 0" })
    expect(withPrimaryTextFallback()).toEqual({})
  })
})
