import { staleOutputRemovalHooks } from "@bitcart/configs/by-package-type/lib-tsdown"
import { defineConfig } from "tsdown"
import svgr from "vite-plugin-svgr"

export default defineConfig({
  entry: {
    "components/index": "src/components/index.ts",
    constants: "src/constants.ts",
    fonts: "src/fonts.ts",
    "hooks/index": "src/hooks/index.ts",
    icons: "src/icons/index.ts",
    "providers/index": "src/providers/index.ts",
    types: "src/types.ts",
    "utils/index": "src/utils/index.ts",
  },

  clean: false,
  deps: { neverBundle: true },
  dts: true,
  format: ["esm"],
  hooks: staleOutputRemovalHooks,
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
  plugins: [svgr()],
  sourcemap: true,
  tsconfig: "./tsconfig.json",
  unbundle: true,
})
