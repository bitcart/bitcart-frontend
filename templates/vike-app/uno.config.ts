import { FONTS_PREFLIGHT, FONTS_PRESET_CONFIG } from "@bitcart/ui-kit/fonts"
import { presetBitcart } from "@bitcart/unocss-preset"
import { defineConfig, presetWebFonts } from "unocss"

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
        name: "bitcart-vike-app-template",

        light: {},

        dark: {},
      },

      preflights: [FONTS_PREFLIGHT],
    }),

    presetWebFonts(FONTS_PRESET_CONFIG),
  ],
})
