import {
  definePreset,
  presetTypography,
  presetWind4,
  PresetWind4Theme,
  transformerVariantGroup,
} from "unocss"
import { presetAnimations } from "unocss-preset-animations"
import { presetShadcn } from "unocss-preset-shadcn"

import { getColorScheme } from "./color-scheme"
import { BREAKPOINTS, DEFAULT_BASE_RADIUS_REM, PRESET_NAME } from "./constants"
import { extractorNestedArbitraryVariants } from "./extractors"
import {
  createGetRadiusCSSVariables,
  getBreakpointCSSVariables,
  getPreflightCSS,
} from "./preflights"
import type { PresetBitcart, PresetBitcartOptions } from "./types"
import { variants } from "./variants"

export * from "./types"

export const presetBitcart: PresetBitcart = definePreset((options?: PresetBitcartOptions) => {
  const {
    baseRadius: baseRadiusRem = DEFAULT_BASE_RADIUS_REM,
    colorScheme: colorSchemeCustomizations,
    prefix,
    preflights: additionalPreflights = [],
  } = options ?? {}

  return {
    name: `unocss-preset-${PRESET_NAME}`,
    variants,
    extractors: [extractorNestedArbitraryVariants],
    transformers: [transformerVariantGroup()],

    presets: [
      presetWind4({ preflights: { reset: true, theme: true }, breakpoint: BREAKPOINTS, prefix }),
      presetTypography<PresetWind4Theme>(),
      presetAnimations(),

      // @ts-expect-error https://github.com/unocss-community/unocss-preset-shadcn/issues/35
      presetShadcn({
        color: getColorScheme(colorSchemeCustomizations),
      }),
    ],

    // Additional allow-list of transition properties
    // See https://github.com/unocss/unocss/issues/4188
    theme: {
      breakpoint: BREAKPOINTS,

      property: {
        display: "display",
        overlay: "overlay",
        rotate: "rotate",
        scale: "scale",
        translate: "translate",
      },
    },

    preflights: [
      { getCSS: getPreflightCSS },
      { getCSS: createGetRadiusCSSVariables(baseRadiusRem) },
      { getCSS: getBreakpointCSSVariables },

      ...additionalPreflights,
    ],

    safelist: ["sr-only", "dark:brightness-0", "dark:invert"],

    shortcuts: {
      "elevation-none": "shadow-none",
      "elevation-1": "shadow-sm hover:shadow-md transition-shadow duration-200",
      "elevation-2": "shadow-md hover:shadow-lg transition-shadow duration-200",
      "elevation-3": "shadow-lg hover:shadow-xl transition-shadow duration-200",
      "elevation-4": "shadow-xl hover:shadow-2xl transition-shadow duration-200",
      "text-size-inherit": "font-size-inherit",
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
      //*      so both `calc(100%+var(--x))` and `calc(100%_+_var(--x))` produce valid CSS
      [
        /^transform-\[(.+)\]$/,
        ([, value]) => ({
          transform: value.replace(/_/g, " ").replace(/(?<=[)\d%])([+-])(?=[a-zA-Z(])/g, " $1 "),
        }),
      ],
    ],

    // autocomplete: {
    //   shorthands: {
    //     elevation: ["none", ...Array.from({ length: 4 }, (_, idx) => `${idx + 1}`)],
    //   },
    // },
  }
}) as PresetBitcart
