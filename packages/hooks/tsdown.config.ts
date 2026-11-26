import { staleOutputRemovalHooks } from "@bitcart/configs/by-package-type/lib-tsdown"
import { reactCompilerPlugin } from "@bitcart/configs/by-view-layer/react-tsdown"
import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },

  clean: false,
  deps: { neverBundle: true },
  dts: { generator: "oxc" },
  format: ["esm"],
  hooks: staleOutputRemovalHooks,
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
  plugins: [reactCompilerPlugin()],
  sourcemap: true,
  tsconfig: "./tsconfig.lib.json",
  unbundle: true,
})
