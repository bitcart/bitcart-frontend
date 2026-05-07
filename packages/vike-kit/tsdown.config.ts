import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    "config/index": "src/config/index.ts",
    "i18n/index": "src/i18n/index.ts",
    "lifecycle/before-render": "src/lifecycle/before-render.ts",
    "lifecycle/before-route": "src/lifecycle/before-route.ts",
    "lifecycle/page-transition-end": "src/lifecycle/page-transition-end.ts",
    "lifecycle/prerender-start": "src/lifecycle/prerender-start.ts",
    "metadata/index": "src/metadata/index.ts",
    "navigation/index": "src/navigation/index.ts",
    "telemetry/index": "src/telemetry/index.ts",
    types: "src/types.ts",
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
