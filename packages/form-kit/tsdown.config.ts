import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    "hooks/index": "src/hooks/index.ts",
  },

  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: !!process.env.BITCART_ENV && process.env.BITCART_ENV !== "development",
  tsconfig: "./tsconfig.lib.json",
  deps: { skipNodeModulesBundle: true },
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
  unbundle: true,
})
