import { FONTS_PREFLIGHT, FONTS_PRESET_CONFIG } from "@bitcart/ui-kit/fonts"
import { presetBitcart } from "@bitcart/unocss-preset"
import { defineConfig, presetWebFonts } from "unocss"

import { COLOR_SCHEME_INPUTS as DIRECTORY_COLOR_SCHEME_INPUTS } from "../directory/uno.config"
import { COLOR_SCHEME_INPUTS as LANDING_COLOR_SCHEME_INPUTS } from "../landing/uno.config"

export default defineConfig({
  cli: {
    entry: {
      patterns: ["src/views/**/*.{ts,tsx}", "../../packages/ui-kit/src/**/*.tsx"],
      outFile: "src/routes/-layout/uno.generated.css",
    },
  },

  outputToCssLayers: true,

  presets: [
    presetBitcart({
      colorSchemes: [
        { name: "landing", ...LANDING_COLOR_SCHEME_INPUTS },
        { name: "directory", ...DIRECTORY_COLOR_SCHEME_INPUTS },
      ],

      preflights: [FONTS_PREFLIGHT],
    }),

    presetWebFonts(FONTS_PRESET_CONFIG),
  ],
})
