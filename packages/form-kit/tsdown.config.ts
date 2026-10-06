import { staleOutputRemovalHooks } from "@bitcart/configs/by-package-type/lib-tsdown"
import { linguiCatalogsPlugin } from "@bitcart/configs/supplementary/lingui-catalogs"
import { linguiMacrosPlugin } from "@bitcart/configs/supplementary/lingui-macros"
import { getConfig } from "@lingui/conf"
import { defineConfig } from "tsdown"

const linguiConfig = getConfig({ cwd: import.meta.dirname })

export default defineConfig({
  entry: {
    "hooks/index": "src/hooks/index.ts",
    "i18n/index": "src/i18n/index.ts",
    "validation/index": "src/validation/index.ts",
  },

  clean: false,
  deps: { neverBundle: true },
  dts: true,
  format: ["esm"],
  hooks: staleOutputRemovalHooks,
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),

  //* The output keeps source messages: validation renders them while a catalog is missing.
  plugins: [
    linguiMacrosPlugin(linguiConfig, { descriptorFields: "message" }),
    linguiCatalogsPlugin(linguiConfig),
  ],

  sourcemap: true,
  tsconfig: "./tsconfig.json",
  unbundle: true,
})
