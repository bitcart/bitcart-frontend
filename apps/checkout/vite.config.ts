import { lingui } from "@lingui/vite-plugin"
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
    strictPort: true,
  },

  preview: {
    port: DEV_ENV_PORT,
    strictPort: true,
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

    //! Both run in Vite's "pre" stage in this order: Lingui macros must expand before React
    //! Compiler hoists JSX out of `<Trans>`, or the message ids stop matching the catalogs.
    lingui({ macroTransform: true }),
    viteReact({ compiler: true }),
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
