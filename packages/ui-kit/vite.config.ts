import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import react from "@vitejs/plugin-react"
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
    react({
      babel: {
        plugins: [
          /*"babel-plugin-react-compiler"*/
        ],
      },
    }),
    dts({ bundleTypes: false, tsconfigPath: "./tsconfig.lib.json" }),
    externalizeDeps(),
  ],

  build: {
    sourcemap: true,

    lib: {
      name: packageManifest.name,

      entry: {
        components: resolve(__dirname, "src/components/index.ts"),
        hooks: resolve(__dirname, "src/hooks/index.ts"),
        providers: resolve(__dirname, "src/providers/index.ts"),
        utils: resolve(__dirname, "src/utils/index.ts"),
      },

      fileName: (_, entryName) => `${entryName === "index" ? "" : entryName + "/"}index.js`,

      formats: ["es"],
    },
  },
})
