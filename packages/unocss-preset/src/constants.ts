import type {
  AriaBooleanState,
  BreakpointKey,
  BreakpointValue,

  // oxlint-disable-next-line no-unused-vars
  PresetBitcartOptions,
} from "./types"

export const PRESET_NAME = "bitcart"

/**
 * Make sure to keep the `@default` docstring declaration in
 * {@link PresetBitcartOptions.baseRadius} in sync with this value.
 */
export const DEFAULT_BASE_RADIUS_REM = 0.375

export const BREAKPOINT_SIZES: BreakpointKey[] = ["sm", "md", "lg", "xl", "2xl", "3xl"]

//* See defaults in https://tailwindcss.com/docs/theme#default-theme-variable-reference
export const BREAKPOINTS: Record<BreakpointKey, BreakpointValue> = {
  sm: "40rem",
  md: "48rem",
  lg: "64rem",
  xl: "80rem",
  "2xl": "96rem",
  "3xl": "112rem",
}

export const ARIA_BOOLEAN_STATES: AriaBooleanState[] = [
  "checked",
  "disabled",
  "expanded",
  "hidden",
  "pressed",
  "readonly",
  "required",
  "selected",
  "invalid",
]
