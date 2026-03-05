import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import dts from "unplugin-dts/vite"
import { defineConfig } from "vite"
import { externalizeDeps } from "vite-plugin-externalize-deps"
import tsconfigPaths from "vite-tsconfig-paths"

import packageManifest from "./package.json"

const __dirname = dirname(fileURLToPath(import.meta.url))

// FIXME: Improve tree-shaking
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    dts({ bundleTypes: false, tsconfigPath: "./tsconfig.lib.json" }),
    externalizeDeps(),
  ],

  build: {
    sourcemap: true,

    lib: {
      name: packageManifest.name,

      entry: {
        constants: resolve(__dirname, "src/constants.ts"),
        utils: resolve(__dirname, "src/utils/index.ts"),
        zod: resolve(__dirname, "src/zod/index.ts"),
      },

      fileName: (_, entryName) => {
        switch (entryName) {
          case "constants": {
            return "constants.js"
          }

          default: {
            return `${entryName === "index" ? "" : entryName + "/"}index.js`
          }
        }
      },

      formats: ["es"],
    },
  },
})
