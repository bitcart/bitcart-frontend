import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    index: "src/common/index.ts",
    e2e: "src/e2e/index.ts",
    unit: "src/unit/index.ts",
  },

  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: !!process.env.BITCART_ENV && process.env.BITCART_ENV !== "development",
  tsconfig: "./tsconfig.json",
  deps: { skipNodeModulesBundle: true },
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
})
