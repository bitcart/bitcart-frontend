import { presetBitcart } from "@bitcart/unocss-preset"
import { defineConfig } from "unocss"

export default defineConfig({
  cli: {
    entry: {
      patterns: ["src/**/*.tsx"],
      outFile: "src/styles/uno.generated.css",
    },
  },

  //! Do not define any color scheme values in this config,
  //! as they are defined in the preset
  //! and redefined at the app level if needed.
  presets: [presetBitcart()],
})
