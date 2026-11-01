import type { Preflight, PresetFactory, PresetWind4Theme } from "unocss"
import type { PresetMiniOptions } from "unocss/preset-mini"

import type { ThemeOverrides } from "#/types"

export type PresetBitcartPreflight = Preflight<PresetWind4Theme>

/**
 * Enforces the correctness of {@link PresetBitcartOptions.baseRadius}.
 */
export type DefaultBaseRadiusRem = 0.375

export type PresetBitcartOptions = {
  /**
   * The base radius in rem.
   *
   * Defaults to {@link DefaultBaseRadiusRem}.
   */
  baseRadius?: number

  /**
   * A single theme emits its CSS variables on `:root`. An array emits each theme scoped under
   * a `.theme-<name>` class instead (with dark overrides under `.dark .theme-<name>`),
   * letting one build serve multiple brands.
   */
  themeOverrides?: ThemeOverrides | (ThemeOverrides & { name: string })[]

  prefix?: PresetMiniOptions["prefix"]

  /**
   * Additional preflights to be appended alongside the preset's built-in ones.
   */
  preflights?: PresetBitcartPreflight[]
}

export type PresetBitcart = PresetFactory<PresetWind4Theme, PresetBitcartOptions>
