import process from "process"

import { lingui } from "@lingui/vite-plugin"
import vikeSitemap from "@qalisa/vike-plugin-sitemap"
import babelPlugin, { defineRolldownBabelPreset } from "@rolldown/plugin-babel"
import { createEnv } from "@t3-oss/env-core"
import react from "@vitejs/plugin-react"
import dotenv from "dotenv"
import vike from "vike/plugin"
import { defineConfig } from "vite"

import { envConfig } from "./env.config"
import linguiConfig from "./lingui.config"

dotenv.config({ path: "../../.env", quiet: true })

const env = createEnv({
  clientPrefix: "BITCART_",
  emptyStringAsUndefined: true,
  client: envConfig.clientEnvSchemas,
  shared: envConfig.sharedEnvSchemas,
  runtimeEnv: process.env,
})

const { PRODUCTION_BASE_URL } = env

const { locales: LINGUI_LOCALES, sourceLocale: LINGUI_SOURCE_LOCALE } = linguiConfig

const linguiPreset = defineRolldownBabelPreset({
  preset: () => ({ plugins: ["@lingui/babel-plugin-lingui-macro"] }),
  rolldown: {
    filter: {
      code: /from ['"]@lingui\/(?:react|core)\/macro['"]/,
    },
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: "BITCART_",

  server: {
    allowedHosts: [".internal", ".local"],
    port: 3001,
  },

  plugins: [
    react(),
    lingui(),
    babelPlugin({
      presets: [linguiPreset],
      plugins: [
        /*"babel-plugin-react-compiler"*/
      ],
    }),
    vike(),

    vikeSitemap({
      baseUrl: PRODUCTION_BASE_URL,
      pagesDir: "src/pages",

      sitemapGenerator: (entries) => {
        const localizedEntries = []

        for (const route of entries) {
          for (const locale of LINGUI_LOCALES) {
            let routePath = route.loc.startsWith(PRODUCTION_BASE_URL)
              ? route.loc.substring(PRODUCTION_BASE_URL.length)
              : route.loc

            routePath = routePath.endsWith("/") ? routePath.slice(0, -1) : routePath

            const localizedPath = `${
              locale === LINGUI_SOURCE_LOCALE ? "" : `/${locale}`
            }${routePath}`

            localizedEntries.push({
              loc: PRODUCTION_BASE_URL + localizedPath,
            })
          }
        }

        return localizedEntries
      },

      customEntries: [{ loc: `${PRODUCTION_BASE_URL}/directory.json` }],
      robots: false,
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
