import { describe, expect, test } from "vitest"

import { CHECKOUT_PALETTE_PRESET_IDS, checkoutPaletteSchema } from "./palette"

const parsePrimary = (color: string) =>
  checkoutPaletteSchema.safeParse({ light: { primary: color } })

describe("checkoutPaletteSchema", () => {
  test.each([
    ["oklch(0.628 0.258 29.234)", "0.628 0.258 29.234"],
    ["oklch(62.8% 0.258 29.234)", "0.628 0.258 29.234"],
    ["oklch( 1 0 0 )", "1 0 0"],
    ["oklch(.5 .1 360)", "0.5 0.1 360"],
  ])("reads %j as the token value %j", (color, token) => {
    expect(parsePrimary(color)).toMatchObject({
      success: true,
      data: { light: { primary: token } },
    })
  })

  test.each([
    "red",
    "#ff0000",
    "rgb(255 0 0)",
    "var(--primary)",
    "#ff0000; background: url(https://evil.example)",
    "oklch(1.2 0 0)",
    "oklch(0.5 0.1 361)",
    "oklch(0.5 0.1 30 / 50%)",
    "oklch(0.5 0.1 30) }",
  ])("rejects %j", (color) => {
    expect(parsePrimary(color).success).toBe(false)
  })

  test("rejects tokens the checkout does not theme", () => {
    expect(checkoutPaletteSchema.safeParse({ dark: { "font-family": "#ffffff" } }).success).toBe(
      false,
    )
  })

  test.each(CHECKOUT_PALETTE_PRESET_IDS)("selects the %s preset by its id", (preset) => {
    const palette = checkoutPaletteSchema.parse({ preset })

    expect(palette.light.primary).toMatch(/^[\d.]+ [\d.]+ [\d.]+$/u)
    expect(palette.dark.primary).toMatch(/^[\d.]+ [\d.]+ [\d.]+$/u)
  })

  test("rejects an unknown preset", () => {
    expect(checkoutPaletteSchema.safeParse({ preset: "neon" }).success).toBe(false)
  })

  test("accepts a palette that themes a single mode", () => {
    expect(
      checkoutPaletteSchema.parse({ dark: { success: "oklch(0.866 0.295 142.495)" } }),
    ).toStrictEqual({
      light: {},
      dark: { success: "0.866 0.295 142.495" },
    })
  })
})
