import { fileURLToPath } from "node:url"

import {
  failBuildOnPrerenderError,
  nitroFumadocsResolveAliases,
  nitroSsrExternalCjsPackages,
  serveLinguiCatalogsOverLan,
} from "@bitcart/configs/supplementary/tanstack-start-vite"
import { lingui } from "@lingui/vite-plugin"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import mdx from "fumadocs-mdx/vite"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"
import { imagetools } from "vite-imagetools"

import { nodeEnv, NODE_ENV_VITE_CONFIG } from "./node-env.ts"
import { getSitePages, readPostFiles } from "./src/common/content/files.ts"
import { NOT_FOUND_PAGE_PRERENDER_HEADER } from "./src/common/prerender.ts"

const DEV_ENV_PORT = 3003
const { PRODUCTION_BASE_URL } = nodeEnv

const SITE_PAGES = getSitePages(
  readPostFiles(fileURLToPath(new URL("content/posts", import.meta.url))),
)

const PAGES = [
  ...SITE_PAGES.map(({ path, lastmod }) => ({ path, sitemap: { lastmod } })),

  { path: "/rss.xml", sitemap: { exclude: true } },
  { path: "/search.json", sitemap: { exclude: true } },

  {
    path: "/404",
    sitemap: { exclude: true },

    prerender: {
      outputPath: "/404.html",
      headers: { [NOT_FOUND_PAGE_PRERENDER_HEADER]: "1" },
    },
  },
]

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
    mdx(),
    imagetools(),

    tanstackStart({
      prerender: {
        enabled: true,
        autoSubfolderIndex: false,
      },

      sitemap: {
        enabled: true,
        host: PRODUCTION_BASE_URL,
      },

      pages: PAGES,
    }),

    //! Both run in Vite's "pre" stage in this order: Lingui macros must expand before React
    //! Compiler hoists JSX out of `<Trans>`, or the message ids stop matching the catalogs.
    lingui({ macroTransform: true }),
    react({ compiler: true }),
    serveLinguiCatalogsOverLan(),
    failBuildOnPrerenderError(),
    nitro(),
  ],

  environments: {
    ssr: {
      build: {
        rolldownOptions: {
          external: nitroSsrExternalCjsPackages,
        },
      },
    },
  },

  resolve: {
    tsconfigPaths: true,
    alias: nitroFumadocsResolveAliases,
  },

  define: NODE_ENV_VITE_CONFIG,
})
