import { entries, flatMap, isEmpty, map, mergeDeep, pick, pipe, reduce } from "remeda"

import { NEUTRAL_THEME_TWEAK, PALETTE_COLOR_TOKENS } from "#/constants"
import type { ThemeTweak } from "#/schemas"
import type { PaletteColorToken, ThemeColorPaletteOverrides } from "#/types"

import { withPrimaryTextFallback } from "./palette"

const PALETTE_ROOT_SELECTORS: Record<keyof ThemeTweak, string> = {
  light: ":root:not(.dark)",
  dark: ":root.dark",
}

/**
 * Creates a stylesheet fragment with CSS variables for every supported palette color token.
 * Any tokens not listed in {@link PALETTE_COLOR_TOKENS} are ignored.
 */
export const colorPaletteToCssVariables = (
  palette: ThemeColorPaletteOverrides,
  { important = false }: { important?: boolean } = {},
): string =>
  entries(pick(palette, PALETTE_COLOR_TOKENS))
    .map(([token, value]) => `--${token}: ${value}${important ? " !important" : ""};`)
    .join("\n")

export const paletteColorVariableToOklchNotation = (token: PaletteColorToken): string =>
  `oklch(var(--${token}))`

export const themeTweakSequenceToGlobalColorVariableOverrides: (params: {
  stylesheetElementId: string
  themeTweaks: ThemeTweak[]
}) => string[] = ({ stylesheetElementId, themeTweaks }) =>
  pipe(
    themeTweaks,

    map(({ light, dark }) => ({
      light: withPrimaryTextFallback(light),
      dark: withPrimaryTextFallback(dark),
    })),

    reduce<ThemeTweak, ThemeTweak>(
      (mergedTheme, themeLayer) => mergeDeep(mergedTheme, themeLayer),
      NEUTRAL_THEME_TWEAK,
    ),

    entries(),

    flatMap(([paletteKey, palette]) => {
      const colorVariables = colorPaletteToCssVariables(palette, { important: true })

      return isEmpty(colorVariables)
        ? []
        : [
            `${PALETTE_ROOT_SELECTORS[paletteKey]}:has(#${stylesheetElementId})` +
              ` {\n${colorVariables}\n}`,
          ]
    }),
  )
