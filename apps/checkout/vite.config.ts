import { lingui, linguiTransformerBabelPreset } from "@lingui/vite-plugin"
import rolldownBabel from "@rolldown/plugin-babel"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const DEV_ENV_PORT = 3002

//* https://vitejs.dev/config/
export default defineConfig({
  envPrefix: "BITCART_",

  server: {
    allowedHosts: [".internal", ".local"],
    port: DEV_ENV_PORT,
  },

  preview: {
    port: DEV_ENV_PORT,
  },

  plugins: [
    devtools(),

    tanstackStart({
      spa: {
        enabled: true,

        //* The shell is rendered at this path, and the app has no `/` route.
        maskPath: "/i/_shell",

        prerender: { enabled: true },
      },
    }),

    viteReact(),
    lingui(),

    rolldownBabel({
      presets: [linguiTransformerBabelPreset()],
    }),
  ],

  resolve: {
    tsconfigPaths: true,
  },

  define: {
    "import.meta.env.PRODUCTION_BASE_URL": JSON.stringify(process.env.PRODUCTION_BASE_URL),
    "import.meta.env.PROJECT_CANONICAL_NAME": JSON.stringify(process.env.PROJECT_CANONICAL_NAME),
  },

  build: {
    sourcemap: true,
  },
})
