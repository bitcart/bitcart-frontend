import type { MandatoryColorSchemeCSSVarKey } from "@bitcart/unocss-preset"
import * as z from "zod"

import { CHECKOUT_PALETTE_PRESETS, type CheckoutPalettePresetId } from "./presets"
import { CHECKOUT_SIGNATURE_TOKENS } from "./signature"

export type OklchTriplet = `${number} ${number} ${number}`

const OKLCH_PATTERN =
  /^oklch\(\s*(?<l>\d*\.?\d+)(?<percent>%?)\s+(?<c>\d*\.?\d+)\s+(?<h>\d*\.?\d+)\s*\)$/u

const MAX_HUE = 360

//* Tokens unknown to `presetBitcart`, emitted by the checkout's own UnoCSS preflight.
export const CHECKOUT_STATUS_TOKENS = [
  "success",
  "success-foreground",
  "warning",
  "pending",
] as const

export type CheckoutThemeToken =
  | MandatoryColorSchemeCSSVarKey
  | (typeof CHECKOUT_STATUS_TOKENS)[number]

const CHECKOUT_THEME_TOKENS = Object.keys(CHECKOUT_SIGNATURE_TOKENS.light) as CheckoutThemeToken[]

const colorSchema = z.string().transform((value, context): OklchTriplet => {
  const { l, percent, c, h } = OKLCH_PATTERN.exec(value)?.groups ?? {}
  const lightness = Number(l) / (percent ? 100 : 1)

  if (l && c && h && lightness <= 1 && Number(h) <= MAX_HUE) {
    return `${Number(lightness.toFixed(6))} ${Number(c)} ${Number(h)}`
  } else {
    context.addIssue({ code: "custom", message: `"${value}" is not an oklch() color` })

    return z.NEVER
  }
})

const tokenValuesSchema = z.partialRecord(z.enum(CHECKOUT_THEME_TOKENS), colorSchema).default({})

const paletteTokensSchema = z.strictObject({
  light: tokenValuesSchema,
  dark: tokenValuesSchema,
})

export type CheckoutPaletteTokensInput = z.input<typeof paletteTokensSchema>

export const CHECKOUT_PALETTE_PRESET_IDS = Object.keys(
  CHECKOUT_PALETTE_PRESETS,
) as CheckoutPalettePresetId[]

const palettePresetSchema = z
  .strictObject({ preset: z.enum(CHECKOUT_PALETTE_PRESET_IDS) })
  .transform(({ preset }): CheckoutPaletteTokensInput => CHECKOUT_PALETTE_PRESETS[preset])
  .pipe(paletteTokensSchema)

export const checkoutPaletteSchema = z.union([palettePresetSchema, paletteTokensSchema])

export type CheckoutPaletteInput = z.input<typeof checkoutPaletteSchema>

export type CheckoutPalette = z.output<typeof checkoutPaletteSchema>
