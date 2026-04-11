import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: process.env.BITCART_ENV !== "development",
  tsconfig: "./tsconfig.lib.json",
  deps: { skipNodeModulesBundle: true },
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
})
