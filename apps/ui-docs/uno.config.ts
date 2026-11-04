import {
  FONTS_PRESET_CONFIG,
  GEIST_MONO_PREFLIGHT,
  INTER_SUBSETS_PREFLIGHT,
} from "@bitcart/ui-kit/fonts"
import { presetBitcart } from "@bitcart/unocss-kit/preset"
import { defineConfig, presetWebFonts } from "unocss"

export default defineConfig({
  cli: {
    entry: {
      patterns: ["src/views/**/*.{ts,tsx}", "../../packages/ui-kit/src/**/*.{ts,tsx}"],
      outFile: "src/routes/-layout/uno.generated.css",
    },
  },

  outputToCssLayers: true,

  presets: [
    presetBitcart({
      themeOverrides: {
        name: "bitcart-ui-docs",
      },

      preflights: [INTER_SUBSETS_PREFLIGHT, GEIST_MONO_PREFLIGHT],
    }),

    presetWebFonts(FONTS_PRESET_CONFIG),
  ],
})
