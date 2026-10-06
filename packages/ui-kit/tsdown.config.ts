import { staleOutputRemovalHooks } from "@bitcart/configs/by-package-type/lib-tsdown"
import { linguiCatalogsPlugin } from "@bitcart/configs/supplementary/lingui-catalogs"
import { linguiMacrosPlugin } from "@bitcart/configs/supplementary/lingui-macros"
import { getConfig } from "@lingui/conf"
import { defineConfig } from "tsdown"
import svgr from "vite-plugin-svgr"

const linguiConfig = getConfig({ cwd: import.meta.dirname })

export default defineConfig({
  entry: {
    "components/index": "src/components/index.ts",
    constants: "src/constants.ts",
    fonts: "src/fonts.ts",
    "hooks/index": "src/hooks/index.ts",
    "i18n/index": "src/i18n/index.ts",
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

  //* The output keeps source messages: components render them while a catalog is missing.
  plugins: [
    svgr(),
    linguiMacrosPlugin(linguiConfig, { descriptorFields: "message" }),
    linguiCatalogsPlugin(linguiConfig),
  ],

  sourcemap: true,
  tsconfig: "./tsconfig.json",
  unbundle: true,
})
