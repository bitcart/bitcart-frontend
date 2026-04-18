import type { Preflight, PresetFactory, PresetWind4Theme } from "unocss"
import type { PresetMiniOptions } from "unocss/preset-mini"

export type BreakpointKey = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"

export type BreakpointValue = `${number}rem`

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

export type ColorSchemeColorString =
  | `${number}% ${number} ${number}`
  | `${number} ${number} ${number}`

export type MandatoryColorSchemeCSSVarKey =
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

export type OptionalColorSchemeCSSVarKey =
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "sidebar"
  | "sidebar-foreground"
  | "sidebar-primary"
  | "sidebar-primary-foreground"
  | "sidebar-accent"
  | "sidebar-accent-foreground"
  | "sidebar-border"
  | "sidebar-ring"

export type ColorSchemeCSSVarKey = MandatoryColorSchemeCSSVarKey | OptionalColorSchemeCSSVarKey

export type MandatoryColorSchemeCSSVars = Record<
  MandatoryColorSchemeCSSVarKey,
  ColorSchemeColorString
>

export type OptionalColorSchemeCSSVars = Partial<
  Record<OptionalColorSchemeCSSVarKey, ColorSchemeColorString>
>

export type ColorSchemeCSSVars = MandatoryColorSchemeCSSVars & OptionalColorSchemeCSSVars

export type ThemeColorSchemeParams = {
  name?: string
  light?: Partial<ColorSchemeCSSVars>
  dark?: Partial<ColorSchemeCSSVars>
}

export type ThemeColorScheme = {
  name: string
  light: ColorSchemeCSSVars
  dark: ColorSchemeCSSVars
}

export type PresetBitcartPreflight = Preflight<PresetWind4Theme>

export type PresetBitcartOptions = {
  /**
   * @default 0.375
   */
  baseRadius?: number

  colorScheme?: ThemeColorSchemeParams
  prefix?: PresetMiniOptions["prefix"]

  /**
   * Additional preflights to be appended alongside the preset's built-in ones.
   */
  preflights?: PresetBitcartPreflight[]
}

export type PresetBitcart = PresetFactory<PresetWind4Theme, PresetBitcartOptions>
