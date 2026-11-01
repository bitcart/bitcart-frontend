import { staleOutputRemovalHooks } from "@bitcart/configs/by-package-type/lib-tsdown"
import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    constants: "src/constants.ts",
    "preset/index": "src/preset/index.ts",
    schemas: "src/schemas.ts",
    "test-templates/index": "src/test-templates/index.ts",
    types: "src/types.ts",
    "utils/index": "src/utils/index.ts",
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
