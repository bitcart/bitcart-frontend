import { staleOutputRemovalHooks } from "@bitcart/configs/by-package-type/lib-tsdown"
import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    "hooks/index": "src/hooks/index.ts",
    "validation/index": "src/validation/index.ts",
  },

  clean: false,
  deps: { neverBundle: true },
  dts: true,
  format: ["esm"],
  hooks: staleOutputRemovalHooks,
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
  sourcemap: true,
  tsconfig: "./tsconfig.json",
  unbundle: true,
})
