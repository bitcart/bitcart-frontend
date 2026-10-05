import { staleOutputRemovalHooks } from "@bitcart/configs/by-package-type/lib-tsdown"
import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    "env/index": "src/env/index.ts",
    "i18n/index": "src/i18n/index.ts",
    "metadata/index": "src/metadata/index.ts",
    "navigation/index": "src/navigation/index.ts",
    types: "src/common/types.ts",
    "utils/index": "src/common/utils/index.ts",
    "validation/index": "src/validation/index.ts",
  },

  clean: false,
  deps: { neverBundle: true },
  dts: { generator: "oxc" },
  format: ["esm"],
  hooks: staleOutputRemovalHooks,
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
  sourcemap: true,
  tsconfig: "./tsconfig.lib.json",
  unbundle: true,
})
