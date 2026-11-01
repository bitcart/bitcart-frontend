import type { OklchColor, OklchColorTriplet } from "@bitcart/core/colors"
import type { IsEqual } from "@bitcart/core/types"
import { z } from "zod"

import { MAX_CSS_COLOR_HUE, OKLCH_CSS_NOTATION_PATTERN, PALETTE_COLOR_TOKENS } from "./constants"
import type { PaletteColorToken, ThemeOverrides } from "./types"

const toInvalidOklchColorMessage = (value: unknown) =>
  `${JSON.stringify(value)} is not an oklch() color`

export const oklchColorSchema: z.ZodPipe<
  z.ZodCustom<OklchColor, OklchColor>,
  z.ZodTransform<OklchColorTriplet, OklchColor>
> = z
  .custom<OklchColor>(
    (value) => typeof value === "string" && OKLCH_CSS_NOTATION_PATTERN.test(value),
    { error: ({ input }) => toInvalidOklchColorMessage(input) },
  )
  .transform((value, context): OklchColorTriplet => {
    const { l, percent, c, h } = OKLCH_CSS_NOTATION_PATTERN.exec(value)?.groups ?? {}
    const lightness = Number(l) / (percent ? 100 : 1)

    if (l && c && h && lightness <= 1 && Number(h) <= MAX_CSS_COLOR_HUE) {
      return `${Number(lightness.toFixed(6))} ${Number(c)} ${Number(h)}`
    } else {
      context.addIssue({ code: "custom", message: toInvalidOklchColorMessage(value) })

      return z.NEVER
    }
  })

export const themeTweakColorPaletteSchema: z.ZodDefault<
  z.ZodRecord<
    z.ZodEnum<z.core.util.ToEnum<PaletteColorToken>> & z.core.$partial,
    typeof oklchColorSchema
  >
> = z.partialRecord(z.enum(PALETTE_COLOR_TOKENS), oklchColorSchema).default({})

export const themeTweakSchema: z.ZodObject<
  { light: typeof themeTweakColorPaletteSchema; dark: typeof themeTweakColorPaletteSchema },
  z.core.$strict
> = z.strictObject({
  light: themeTweakColorPaletteSchema,
  dark: themeTweakColorPaletteSchema,
})

export type ThemeTweakInput = z.input<typeof themeTweakSchema>

export type ThemeTweak = z.output<typeof themeTweakSchema>

true satisfies IsEqual<ThemeTweak, Required<Omit<ThemeOverrides, "name">>>
