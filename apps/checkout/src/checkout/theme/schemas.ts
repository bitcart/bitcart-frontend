import type { IsEqual } from "@bitcart/core/types"
import {
  themeTweakSchema,
  type ThemeTweakInput,
  type ThemeTweak,
} from "@bitcart/unocss-kit/schemas"
import { z } from "zod"

import { CHECKOUT_THEME_PRESET_IDS, CHECKOUT_THEME_PRESETS } from "./presets"

const checkoutThemeTweakSchema = z
  .strictObject({ preset: z.enum(CHECKOUT_THEME_PRESET_IDS) })
  .transform(({ preset }): ThemeTweakInput => CHECKOUT_THEME_PRESETS[preset])
  .pipe(themeTweakSchema)

export const checkoutThemeSchema = z.union([checkoutThemeTweakSchema, themeTweakSchema])

export type CheckoutThemeInput = z.input<typeof checkoutThemeSchema>

export type CheckoutTheme = z.output<typeof checkoutThemeSchema>

true satisfies IsEqual<CheckoutTheme, ThemeTweak>
