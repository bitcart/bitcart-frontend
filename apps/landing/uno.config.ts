import { FONTS_PREFLIGHT, FONTS_PRESET_CONFIG } from "@bitcart/ui-kit/fonts"
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

      preflights: [FONTS_PREFLIGHT],
    }),

    presetWebFonts(FONTS_PRESET_CONFIG),
  ],
})
