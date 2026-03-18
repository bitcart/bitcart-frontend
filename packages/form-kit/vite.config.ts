import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import babelPlugin from "@rolldown/plugin-babel"
import react from "@vitejs/plugin-react"
import dts from "unplugin-dts/vite"
import { defineConfig } from "vite"
import { externalizeDeps } from "vite-plugin-externalize-deps"

import packageManifest from "./package.json"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    babelPlugin({
      plugins: [
        /*"babel-plugin-react-compiler"*/
      ],
    }),
    dts({ bundleTypes: false, tsconfigPath: "./tsconfig.lib.json" }),
    externalizeDeps(),
  ],

  resolve: {
    tsconfigPaths: true,
  },

  build: {
    sourcemap: true,

    lib: {
      name: packageManifest.name,

      entry: {
        hooks: resolve(__dirname, "src/hooks/index.ts"),
      },

      fileName: (_, entryName) => `${entryName === "index" ? "" : entryName + "/"}index.js`,

      formats: ["es"],
    },
  },
})
