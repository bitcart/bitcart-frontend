import { staleOutputRemovalHooks } from "@bitcart/configs/by-package-type/lib-tsdown"
import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    index: "src/common/index.ts",
    e2e: "src/e2e/index.ts",
    unit: "src/unit/index.ts",
  },

  clean: false,
  deps: { neverBundle: true },
  dts: true,
  format: ["esm"],
  hooks: staleOutputRemovalHooks,
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
  sourcemap: true,
  tsconfig: "./tsconfig.json",
})
