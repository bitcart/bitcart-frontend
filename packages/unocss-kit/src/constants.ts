import type { IsUnionMemberList } from "@bitcart/core/types"

import type { ThemeTweak } from "./schemas"
import type {
  AriaBooleanState,
  BreakpointKey,
  PaletteColorToken,
  ExtendedPaletteColorToken,
  BasePaletteColorToken,
  MaxCssColorHue,
} from "./types"

export const BREAKPOINT_KEYS: BreakpointKey[] = ["sm", "md", "lg", "xl", "2xl", "3xl"]

export const OKLCH_CSS_NOTATION_PATTERN: RegExp =
  /^oklch\(\s*(?<l>\d*\.?\d+)(?<percent>%?)\s+(?<c>\d*\.?\d+)\s+(?<h>\d*\.?\d+)\s*\)$/u

export const MAX_CSS_COLOR_HUE: MaxCssColorHue = 360

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

export const BASE_PALETTE_COLOR_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
] as const

true satisfies IsUnionMemberList<BasePaletteColorToken, typeof BASE_PALETTE_COLOR_TOKENS>

export const EXTENDED_PALETTE_COLOR_TOKENS = [
  "primary-text",
  "success",
  "success-foreground",
  "warning",
  "pending",
] as const

true satisfies IsUnionMemberList<ExtendedPaletteColorToken, typeof EXTENDED_PALETTE_COLOR_TOKENS>

export const PALETTE_COLOR_TOKENS: readonly PaletteColorToken[] = [
  ...BASE_PALETTE_COLOR_TOKENS,
  ...EXTENDED_PALETTE_COLOR_TOKENS,
]

export const NEUTRAL_THEME_TWEAK: ThemeTweak = { light: {}, dark: {} }

export const NESTED_COLOR_TOKEN_SUFFIXES = ["foreground", "text"] as const

export const WCAG_TEXT_CONTRAST_COLOR_TOKEN_PAIRS: [PaletteColorToken, PaletteColorToken][] = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["muted-foreground", "card"],
  ["muted-foreground", "muted"],
  ["primary-foreground", "primary"],

  //* `primary-text` is the brand color for text on neutral surfaces, where the `primary` fill can be
  //* too dark to read.
  ["primary-text", "background"],
  ["primary-text", "card"],
  ["primary-text", "popover"],
  ["primary-text", "muted"],
  ["primary-text", "secondary"],

  //* `primary-text` is rendered on `accent/30` and `accent/40` only. Both contrast more strongly
  //* than full `accent`: this pair covers them.
  ["primary-text", "accent"],

  ["secondary-foreground", "secondary"],
  ["accent-foreground", "accent"],
  ["accent-foreground", "card"],
  ["destructive-foreground", "card"],
  ["success", "card"],
  ["success-foreground", "success"],
  ["warning", "card"],
  ["pending", "card"],
]
