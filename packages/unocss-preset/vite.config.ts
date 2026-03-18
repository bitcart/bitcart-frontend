import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import dts from "unplugin-dts/vite"
import { defineConfig } from "vite"
import { externalizeDeps } from "vite-plugin-externalize-deps"

import packageManifest from "./package.json"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    dts({ bundleTypes: false, tsconfigPath: "./tsconfig.lib.json" }),
    externalizeDeps({ include: ["oxc-parser"] }),
  ],

  resolve: {
    tsconfigPaths: true,
  },

  build: {
    sourcemap: true,

    lib: {
      name: packageManifest.name,

      entry: {
        index: resolve(__dirname, "src/index.ts"),
      },

      fileName: (_, entryName) => `${entryName === "index" ? "" : entryName + "/"}index.js`,
      formats: ["es"],
    },
  },
})
