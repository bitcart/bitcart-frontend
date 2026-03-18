import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    "config/index": "src/config/index.ts",
    "i18n/index": "src/i18n/index.ts",
    "lifecycle/index": "src/lifecycle/index.ts",
    "metadata/index": "src/metadata/index.ts",
    "navigation/index": "src/navigation/index.ts",
    "tracking/index": "src/tracking/index.ts",
    types: "src/types.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  tsconfig: "./tsconfig.lib.json",
  deps: { skipNodeModulesBundle: true },
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
})
