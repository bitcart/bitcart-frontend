import { presetBitcart } from "@bitcart/unocss-preset"
import { defineConfig } from "unocss"

export default defineConfig({
  cli: {
    entry: {
      patterns: ["src/**/*.tsx"],
      outFile: "src/styles/uno.generated.css",
    },
  },

  presets: [presetBitcart()],
})
