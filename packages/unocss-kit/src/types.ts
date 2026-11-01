import type { OklchColorTriplet } from "@bitcart/core/colors"

export type BreakpointKey = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"

export type BreakpointValue = `${number}rem`

export type MaxCssColorHue = 360

export type AriaBooleanState =
  | "checked"
  | "disabled"
  | "expanded"
  | "hidden"
  | "pressed"
  | "readonly"
  | "required"
  | "selected"
  | "invalid"

/**
 * Color token inherited from the standard Shadcn UI color palette.
 */
export type BasePaletteColorToken =
  | "background"
  | "foreground"
  | "card"
  | "card-foreground"
  | "popover"
  | "popover-foreground"
  | "primary"
  | "primary-foreground"
  | "secondary"
  | "secondary-foreground"
  | "muted"
  | "muted-foreground"
  | "accent"
  | "accent-foreground"
  | "destructive"
  | "destructive-foreground"
  | "border"
  | "input"
  | "ring"
// FIXME: Uncomment the following once any of the workspace members defines chart components:
// | "chart-1"
// | "chart-2"
// | "chart-3"
// | "chart-4"
// | "chart-5"
// FIXME: Uncomment the following once any of the workspace members defines sidebar components:
// | "sidebar"
// | "sidebar-foreground"
// | "sidebar-primary"
// | "sidebar-primary-foreground"
// | "sidebar-accent"
// | "sidebar-accent-foreground"
// | "sidebar-border"
// | "sidebar-ring"

/**
 * Color token introduced as an extension to Shadcn UI standard color palette.
 */
export type ExtendedPaletteColorToken =
  | "primary-text"
  | "success"
  | "success-foreground"
  | "warning"
  | "pending"

export type PaletteColorToken = BasePaletteColorToken | ExtendedPaletteColorToken

export type BaseColorPalette = Record<BasePaletteColorToken, OklchColorTriplet>

export type ExtendedColorPalette = Record<ExtendedPaletteColorToken, OklchColorTriplet>

export type ThemeColorPalette = BaseColorPalette & ExtendedColorPalette

export type ThemeColorPaletteOverrides = Partial<ThemeColorPalette>

export type Theme = {
  name: string
  light: ThemeColorPalette
  dark: ThemeColorPalette
}

/**
 * Overrides for {@link Theme}.
 */
export type ThemeOverrides = {
  name?: string
  light?: ThemeColorPaletteOverrides
  dark?: ThemeColorPaletteOverrides
}
