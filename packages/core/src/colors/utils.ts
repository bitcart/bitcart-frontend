import { formatHex, oklch, toGamut, wcagContrast, type Color, type Rgb } from "culori"

import type { OklchColor, OklchColorTriplet } from "./types"

/**
 * Measures what an sRGB screen shows: tokens outside sRGB are gamut-mapped first.
 */
export const toSrgb: (color: string | Color) => Rgb = toGamut("rgb", "oklch")

export const getSrgbContrast = (
  foreground: OklchColorTriplet,
  background: OklchColorTriplet,
): number => wcagContrast(toSrgb(`oklch(${foreground})`), toSrgb(`oklch(${background})`))

export const oklchTripletToHex = (triplet: OklchColorTriplet): string =>
  formatHex(toSrgb(`oklch(${triplet})` satisfies OklchColor))

/**
 * Perceptual lightness of the triplet, `NaN` when it does not parse as OKLCH.
 */
export const getOklchLightness = (triplet: OklchColorTriplet): number =>
  oklch(`oklch(${triplet})` satisfies OklchColor)?.l ?? Number.NaN
