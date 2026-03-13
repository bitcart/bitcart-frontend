import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { baseOxlintConfig } from "@bitcart/configs/base/oxlint"
import { reactOxlintConfig } from "@bitcart/configs/by-view-layer/react-oxlint"
import { unocssOxlintConfig } from "@bitcart/configs/supplementary/unocss-oxlint"
import { defineConfig } from "oxlint"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  extends: [baseOxlintConfig, reactOxlintConfig, unocssOxlintConfig],

  settings: {
    "better-tailwindcss": {
      entryPoint: resolve(__dirname, "src/styles/uno.generated.css"),
    },
  },
})
