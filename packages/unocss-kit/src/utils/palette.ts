import type { ThemeColorPaletteOverrides } from "#/types"

/**
 * Makes `primary-text` follow `primary` in a palette layer that recolors `primary` alone, so a
 * theme or tweak written against the standard Shadcn UI tokens keeps its brand text in its own hue.
 */
export const withPrimaryTextFallback = (
  palette: ThemeColorPaletteOverrides = {},
): ThemeColorPaletteOverrides =>
  palette.primary !== undefined && palette["primary-text"] === undefined
    ? { ...palette, "primary-text": palette.primary }
    : palette
