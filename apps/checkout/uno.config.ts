import { FONTS_PREFLIGHT, FONTS_PRESET_CONFIG, GEIST_MONO_PREFLIGHT } from "@bitcart/ui-kit/fonts"
import { presetBitcart } from "@bitcart/unocss-kit/preset"
import { defineConfig, presetWebFonts } from "unocss"

export default defineConfig({
  cli: {
    entry: {
      patterns: ["src/**/*.{ts,tsx}", "../../packages/ui-kit/src/**/*.{ts,tsx}"],
      outFile: "src/routes/-layout/uno.generated.css",
    },
  },

  presets: [
    presetBitcart({
      themeOverrides: {
        name: "bitcart-checkout",
      },

      preflights: [FONTS_PREFLIGHT, GEIST_MONO_PREFLIGHT],
    }),

    presetWebFonts(FONTS_PRESET_CONFIG),
  ],
})
