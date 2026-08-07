import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    constants: "src/constants.ts",
    types: "src/types.ts",
    "utils/index": "src/utils/index.ts",
    "zod/index": "src/zod/index.ts",
  },

  clean: !!process.env.BITCART_ENV && process.env.BITCART_ENV !== "development",
  deps: { skipNodeModulesBundle: true },
  dts: { oxc: true },
  format: ["esm"],
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
  sourcemap: true,
  tsconfig: "./tsconfig.lib.json",
  unbundle: true,
})
