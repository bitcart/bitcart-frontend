import { FONTS_PRESET_CONFIG, INTER_SUBSETS_PREFLIGHT } from "@bitcart/ui-kit/fonts"
import { presetBitcart } from "@bitcart/unocss-kit/preset"
import { defineConfig, presetWebFonts } from "unocss"

export default defineConfig({
  cli: {
    entry: {
      patterns: ["src/**/*.{ts,tsx}", "../../packages/ui-kit/src/**/*.{ts,tsx}"],
      outFile: "src/pages/uno.generated.css",
    },
  },

  presets: [
    presetBitcart({
      themeOverrides: {
        name: "bitcart-landing",
      },

      preflights: [INTER_SUBSETS_PREFLIGHT],
    }),

    presetWebFonts(FONTS_PRESET_CONFIG),
  ],
})
