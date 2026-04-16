import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    "components/index": "src/components/index.ts",
    "hooks/index": "src/hooks/index.ts",
    "providers/index": "src/providers/index.ts",
    types: "src/types.ts",
    "utils/index": "src/utils/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: !!process.env.BITCART_ENV && process.env.BITCART_ENV !== "development",
  tsconfig: "./tsconfig.lib.json",
  deps: { skipNodeModulesBundle: true },
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
})
