import {
  failBuildOnPrerenderError,
  nitroFumadocsResolveAliases,
  nitroSsrExternalCjsPackages,
  serveLinguiCatalogsOverLan,
} from "@bitcart/configs/supplementary/tanstack-start-vite"
import story from "@fumadocs/story/vite"
import { lingui } from "@lingui/vite-plugin"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import mdx from "fumadocs-mdx/vite"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"

import { NODE_ENV_VITE_CONFIG } from "./node-env.ts"

const DEV_ENV_PORT = 3100

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
    story({ filter: /[/.]stories\.(js|jsx|ts|tsx)$/ }),
    tailwindcss(),

    tanstackStart({
      spa: {
        enabled: true,

        //* The shell page is keyed by maskPath and pushed after user pages, so the
        //* default maskPath "/" silently replaces the real "/" page below (last entry
        //* per path wins) and no index.html is emitted. Mask it elsewhere so both the
        //* shell and the home page get prerendered.
        maskPath: "/_shell",
        prerender: { enabled: true },
      },

      //* Crawl outward from the pages below so every docs route gets prerendered along
      //* with its static server function cache (required for static hosts like GitHub
      //* Pages, where no server runs the loaders).
      prerender: { enabled: true, crawlLinks: true },

      pages: [
        { path: "/" },
        { path: "/api/search" },
        { path: "llms-full.txt" },
        { path: "llms.txt" },
      ],
    }),

    //! Both run in Vite's "pre" stage in this order: Lingui macros must expand before React
    //! Compiler hoists JSX out of `<Trans>`, or the message ids stop matching the catalogs.
    lingui({ macroTransform: true }),
    react({ compiler: true }),
    serveLinguiCatalogsOverLan(),
    failBuildOnPrerenderError(),

    //* See https://tanstack.com/start/latest/docs/framework/react/guide/hosting#nitro
    //* for guides on hosting
    nitro(),
  ],

  optimizeDeps: {
    //* fumadocs-mdx excludes @fumadocs/base-ui from optimization, so its dependency
    //* @base-ui/react is served unbundled in dev. Base UI >= 1.6 imports the CJS-only
    //* use-sync-external-store shim, which breaks unless pre-bundled explicitly
    //* (fumadocs' curated nested-include list doesn't cover it yet).
    include: [
      "@fumadocs/base-ui > @base-ui/react > use-sync-external-store/shim",
      "@fumadocs/base-ui > @base-ui/react > use-sync-external-store/shim/with-selector",
    ],
  },

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
