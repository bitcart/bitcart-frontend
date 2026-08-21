import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    "i18n/index": "src/i18n/index.ts",
    "metadata/index": "src/metadata/index.ts",
    "navigation/index": "src/navigation/index.ts",
    types: "src/common/types.ts",
    "utils/index": "src/common/utils/index.ts",
    "validation/index": "src/validation/index.ts",
  },

  clean: !!process.env.BITCART_ENV && process.env.BITCART_ENV !== "development",
  deps: { neverBundle: true },
  dts: { oxc: true },
  format: ["esm"],
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
  sourcemap: true,
  tsconfig: "./tsconfig.lib.json",
  unbundle: true,
})
