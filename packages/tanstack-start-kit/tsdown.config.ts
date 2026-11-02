import { staleOutputRemovalHooks } from "@bitcart/configs/by-package-type/lib-tsdown"
import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    "errors/index": "src/errors/index.ts",
    "fumadocs/index": "src/fumadocs/index.ts",
    "i18n/index": "src/i18n/index.ts",
    "metadata/index": "src/metadata/index.ts",
    "navigation/index": "src/navigation/index.ts",
    "telemetry/index": "src/telemetry/index.ts",
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
