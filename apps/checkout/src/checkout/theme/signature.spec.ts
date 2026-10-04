import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { formatHex, toGamut, wcagContrast } from "culori"
import { describe, expect, test } from "vitest"

import { CHECKOUT_PALETTE_PRESET_IDS, checkoutPaletteSchema, type OklchTriplet } from "./palette"
import { CHECKOUT_SIGNATURE_TOKENS } from "./signature"

//* Measures what an sRGB screen shows: tokens outside sRGB are gamut-mapped first.
const toSrgb = toGamut("rgb", "oklch")

const contrast = (foreground: OklchTriplet, background: OklchTriplet) =>
  wcagContrast(toSrgb(`oklch(${foreground})`), toSrgb(`oklch(${background})`))

const HEX_ANNOTATIONS = [
  ...readFileSync(resolve(import.meta.dirname, "signature.ts"), "utf8").matchAll(
    /"(?<triplet>[\d. ]+)", \/\/\s+(?<hex>#[\dA-F]{6})/gu,
  ),
].map(({ groups }) => [groups?.triplet, groups?.hex] as const)

describe("the signature palette's hex annotations", () => {
  test("annotate the brand colors", () => {
    expect(HEX_ANNOTATIONS.length).toBeGreaterThan(0)
  })

  test.each(HEX_ANNOTATIONS)("match %s to %s", (triplet, hex) => {
    expect(formatHex(toSrgb(`oklch(${triplet})`))?.toUpperCase()).toBe(hex)
  })
})

type Token = keyof (typeof CHECKOUT_SIGNATURE_TOKENS)["light"]

const TEXT_PAIRS: [Token, Token][] = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["muted-foreground", "card"],
  ["muted-foreground", "muted"],
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["accent-foreground", "accent"],
  ["accent-foreground", "card"],
  ["destructive-foreground", "card"],
  ["success", "card"],
  ["success-foreground", "success"],
  ["warning", "card"],
  ["pending", "card"],
]

const PALETTES = [
  ["signature", CHECKOUT_SIGNATURE_TOKENS],

  ...CHECKOUT_PALETTE_PRESET_IDS.map((preset) => {
    const { light, dark } = checkoutPaletteSchema.parse({ preset })

    return [
      preset,

      {
        light: { ...CHECKOUT_SIGNATURE_TOKENS.light, ...light },
        dark: { ...CHECKOUT_SIGNATURE_TOKENS.dark, ...dark },
      },
    ] as const
  }),
] as const

describe.each(
  PALETTES.flatMap(([name, palette]) =>
    (["light", "dark"] as const).map((mode) => [name, mode, palette[mode]] as const),
  ),
)("the %s palette in %s mode", (_name, mode, tokens) => {
  test.each(TEXT_PAIRS)("keeps %s readable on %s", (text, surface) => {
    expect(contrast(tokens[text], tokens[surface])).toBeGreaterThanOrEqual(4.5)
  })

  test("keeps the focus ring visible on cards", () => {
    expect(contrast(tokens.ring, tokens.card)).toBeGreaterThanOrEqual(3)
  })

  test("lifts cards off the page and steps borders beyond muted surfaces", () => {
    const lightness = (token: Token) => Number(tokens[token].split(" ")[0])
    const awayFromCard = mode === "light" ? -1 : 1

    expect(lightness("card")).toBeGreaterThan(lightness("background"))
    expect(awayFromCard * (lightness("muted") - lightness("card"))).toBeGreaterThan(0)
    expect(awayFromCard * (lightness("border") - lightness("muted"))).toBeGreaterThan(0)
  })
})
