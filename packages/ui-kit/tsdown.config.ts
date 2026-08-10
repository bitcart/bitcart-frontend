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

  clean: !!process.env.BITCART_ENV && process.env.BITCART_ENV !== "development",
  deps: { skipNodeModulesBundle: true },
  dts: true,
  format: ["esm"],
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
  plugins: [svgr()],
  sourcemap: true,
  tsconfig: "./tsconfig.lib.json",
  unbundle: true,
})
