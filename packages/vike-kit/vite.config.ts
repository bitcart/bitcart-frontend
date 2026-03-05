import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import dts from "unplugin-dts/vite"
import { defineConfig } from "vite"
import { externalizeDeps } from "vite-plugin-externalize-deps"
import tsconfigPaths from "vite-tsconfig-paths"

import packageManifest from "./package.json"

const __dirname = dirname(fileURLToPath(import.meta.url))

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
        config: resolve(__dirname, "src/config/index.ts"),
        i18n: resolve(__dirname, "src/i18n/index.ts"),
        lifecycle: resolve(__dirname, "src/lifecycle/index.ts"),
        metadata: resolve(__dirname, "src/metadata/index.ts"),
        navigation: resolve(__dirname, "src/navigation/index.ts"),
        tracking: resolve(__dirname, "src/tracking/index.ts"),
      },

      fileName: (_, entryName) => `${entryName === "index" ? "" : entryName + "/"}index.js`,

      formats: ["es"],
    },
  },
})
