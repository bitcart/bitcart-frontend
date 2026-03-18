import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    constants: "src/constants.ts",
    types: "src/types.ts",
    "utils/index": "src/utils/index.ts",
    "zod/index": "src/zod/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  tsconfig: "./tsconfig.lib.json",
  deps: { skipNodeModulesBundle: true },
  outExtensions: () => ({ js: ".js", dts: ".d.ts" }),
})
