import type { BreakpointKey, BreakpointValue } from "#/types"

import type { DefaultBaseRadiusRem } from "./types"

export const PRESET_NAME = "bitcart"

export const BASE_THEME_NAME = "bitcart-uno"

export const DEFAULT_DARK_MODE_SELECTOR = ".dark"

export const DEFAULT_BASE_RADIUS_REM: DefaultBaseRadiusRem = 0.375

//* See defaults in https://tailwindcss.com/docs/theme#default-theme-variable-reference
export const BREAKPOINTS: Record<BreakpointKey, BreakpointValue> = {
  sm: "40rem",
  md: "48rem",
  lg: "64rem",
  xl: "80rem",
  "2xl": "96rem",
  "3xl": "112rem",
}
