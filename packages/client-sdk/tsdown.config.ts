import { staleOutputRemovalHooks } from "@bitcart/configs/by-package-type/lib-tsdown"
import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    auth: "src/auth/index.ts",
    config: "src/config.ts",
    endpoints: "src/endpoints/index.ts",
    mocks: "src/mocks/index.ts",
    schemas: "src/schemas/index.ts",
    types: "src/types.ts",
    utils: "src/utils/index.ts",
  },

  clean: false,
  deps: { neverBundle: true },

  //* The `oxc` generator and `isolatedDeclarations` are not applicable
  //* due to the presence of types derived from Zod schemas in the package.
  dts: true,

  format: ["esm"],
  hooks: staleOutputRemovalHooks,
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
  sourcemap: true,
  tsconfig: "./tsconfig.lib.json",
  unbundle: true,
})
