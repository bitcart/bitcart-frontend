import { FONTS_PREFLIGHT, FONTS_PRESET_CONFIG } from "@bitcart/ui-kit/fonts"
import { presetBitcart, type ThemeColorSchemeParams } from "@bitcart/unocss-preset"
import { defineConfig, presetWebFonts } from "unocss"

export const COLOR_SCHEME_INPUTS: ThemeColorSchemeParams = {
  light: {},
  dark: {},
}

export default defineConfig({
  cli: {
    entry: {
      patterns: ["src/**/*.tsx", "../../packages/ui-kit/src/**/*.tsx"],
      outFile: "src/pages/uno.generated.css",
    },
  },

  presets: [
    presetBitcart({
      colorSchemes: {
        name: "bitcart-landing",
        ...COLOR_SCHEME_INPUTS,
      },

      preflights: [FONTS_PREFLIGHT],
    }),

    presetWebFonts(FONTS_PRESET_CONFIG),
  ],
})
