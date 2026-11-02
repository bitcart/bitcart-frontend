import { fromEntries } from "remeda"
import {
  definePreset,
  presetTypography,
  presetWind4,
  type PresetWind4Theme,
  transformerVariantGroup,
} from "unocss"
import { presetAnimations } from "unocss-preset-animations"

import { NESTED_COLOR_TOKEN_SUFFIXES, PALETTE_COLOR_TOKENS } from "#/constants"
import type { PaletteColorToken } from "#/types"
import { paletteColorVariableToOklchNotation } from "#/utils"

import { BREAKPOINTS, DEFAULT_BASE_RADIUS_REM, PRESET_NAME } from "./constants"
import { extractorNestedArbitraryVariants } from "./extractors"
import {
  BREAKPOINT_PREFLIGHT,
  GENERAL_PREFLIGHT,
  MODAL_BLUR_SUPPRESSION_PREFLIGHT,
  createGetPaletteCSSVariables,
  createGetRadiusCSSVariables,
} from "./preflights"
import { getTheme } from "./theme"
import type { PresetBitcart, PresetBitcartOptions } from "./types"
import { variants } from "./variants"

const proseColor = (token: PaletteColorToken): [string, string] => {
  const color = paletteColorVariableToOklchNotation(token)

  return [color, color]
}

//* Theme tokens already switch between light and dark, so `prose` follows the theme without
//* `prose-invert`.
const PROSE_COLOR_SCHEME = {
  body: proseColor("foreground"),
  headings: proseColor("foreground"),
  lead: proseColor("muted-foreground"),
  links: proseColor("primary-text"),
  bold: proseColor("foreground"),
  counters: proseColor("muted-foreground"),
  bullets: proseColor("muted-foreground"),
  hr: proseColor("border"),
  quotes: proseColor("foreground"),
  "quote-borders": proseColor("border"),
  captions: proseColor("muted-foreground"),
  kbd: proseColor("foreground"),
  code: proseColor("foreground"),
  "pre-code": proseColor("foreground"),
  "pre-bg": proseColor("muted"),
  "th-borders": proseColor("border"),
  "td-borders": proseColor("border"),
}

const PROSE_INLINE_CODE_CSS = {
  code: {
    "background-color": paletteColorVariableToOklchNotation("muted"),
    "border-radius": "0.25rem",
    padding: "0.125em 0.375em",
    "font-size": "0.875em",
    "font-weight": "500",
  },

  "code::before": { content: "none" },
  "code::after": { content: "none" },
}

const isNestedColorToken = (token: PaletteColorToken): boolean =>
  NESTED_COLOR_TOKEN_SUFFIXES.some((suffix) => token.endsWith(`-${suffix}`))

export const presetBitcart: PresetBitcart = definePreset((options?: PresetBitcartOptions) => {
  const {
    baseRadius: baseRadiusRem = DEFAULT_BASE_RADIUS_REM,
    themeOverrides,
    prefix,
    preflights: additionalPreflights = [],
  } = options ?? {}

  const brandTheme = Array.isArray(themeOverrides)
    ? themeOverrides.map((brandThemeOverrides) => getTheme(brandThemeOverrides))
    : getTheme(themeOverrides)

  return {
    name: `unocss-preset-${PRESET_NAME}`,
    variants,
    extractors: [extractorNestedArbitraryVariants],
    transformers: [transformerVariantGroup()],

    presets: [
      presetWind4({ preflights: { reset: true, theme: true }, breakpoint: BREAKPOINTS, prefix }),
      presetTypography<PresetWind4Theme>({
        colorScheme: PROSE_COLOR_SCHEME,
        cssExtend: PROSE_INLINE_CODE_CSS,
      }),
      presetAnimations(),
    ],

    theme: {
      breakpoint: BREAKPOINTS,

      colors: fromEntries(
        PALETTE_COLOR_TOKENS.filter((token) => !isNestedColorToken(token)).map((token) => {
          const nestedColors = NESTED_COLOR_TOKEN_SUFFIXES.flatMap((suffix): [string, string][] => {
            const nestedToken = PALETTE_COLOR_TOKENS.find(
              (candidate) => candidate === `${token}-${suffix}`,
            )

            return nestedToken ? [[suffix, paletteColorVariableToOklchNotation(nestedToken)]] : []
          })

          return [
            token,

            nestedColors.length > 0
              ? {
                  DEFAULT: paletteColorVariableToOklchNotation(token),
                  ...fromEntries(nestedColors),
                }
              : paletteColorVariableToOklchNotation(token),
          ]
        }),
      ),

      //* Additional allow-list of transition properties
      //* See https://github.com/unocss/unocss/issues/4188
      property: {
        display: "display",
        overlay: "overlay",
        rotate: "rotate",
        scale: "scale",
        translate: "translate",
      },
    },

    extendTheme: (theme) => {
      theme.radius = { ...theme.radius, DEFAULT: "var(--radius)" }
    },

    preflights: [
      GENERAL_PREFLIGHT,
      { getCSS: createGetPaletteCSSVariables(brandTheme) },
      { getCSS: createGetRadiusCSSVariables(baseRadiusRem) },
      BREAKPOINT_PREFLIGHT,
      MODAL_BLUR_SUPPRESSION_PREFLIGHT,
      ...additionalPreflights,
    ],

    safelist: ["sr-only", "dark:brightness-0", "dark:invert"],

    shortcuts: {
      "elevation-none": "shadow-none",
      "elevation-1": "shadow-sm hover:shadow-md active:shadow-sm transition-shadow duration-200",
      "elevation-2": "shadow-md hover:shadow-lg active:shadow-md transition-shadow duration-200",
      "elevation-3": "shadow-lg hover:shadow-xl active:shadow-lg transition-shadow duration-200",
      "elevation-4": "shadow-xl hover:shadow-2xl active:shadow-xl transition-shadow duration-200",
      "text-size-inherit": "font-size-inherit",
      glassy: "bg-background/50 backdrop-blur-12",
    },

    rules: [
      ["@container-inline-size", { "container-type": "inline-size" }],
      ["@container-normal", { "container-type": "normal" }],
      ["@container-scroll-state", { "container-type": "scroll-state" }],
      ["@container-size", { "container-type": "size" }],

      //* Container name - matches @container-{name} or @container/{name}
      [
        /^@container[-/](.+)$/,

        ([, name]) =>
          ["size", "inline-size", "normal"].includes(name) ? undefined : { "container-name": name },
      ],

      ["bg-initial", { "background-color": "initial" }],

      //* Arbitrary transform values - e.g. transform-[translateY(calc(100%+var(--x)))]
      //* Spaces are handled in two ways:
      //*   1. Underscores are converted to spaces (standard UnoCSS convention)
      //*   2. calc() operators (+/-) between values automatically get spaces added,
      //*      making both `calc(100%+var(--x))` and `calc(100%_+_var(--x))` produce valid CSS
      [
        /^transform-\[(.+)\]$/,
        ([, value]) => ({
          transform: value.replace(/_/g, " ").replace(/(?<=[)\d%])([+-])(?=[a-zA-Z(])/g, " $1 "),
        }),
      ],
    ],
  }
}) as PresetBitcart
