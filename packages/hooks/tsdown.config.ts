import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    index: "src/index.ts",
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
