import story from "@fumadocs/story/vite"
import { lingui, linguiTransformerBabelPreset } from "@lingui/vite-plugin"
import babel from "@rolldown/plugin-babel"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import react from "@vitejs/plugin-react"
import mdx from "fumadocs-mdx/vite"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"

export default defineConfig({
  server: {
    port: 3100,
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

    react(),
    lingui(),

    babel({
      presets: [linguiTransformerBabelPreset()],
    }),

    //* Nitro's dev middleware routes each request either to Vite or to SSR based on the
    //* sec-fetch-dest header, falling back to an extension allowlist that doesn't know
    //* `.po`. Browsers send sec-fetch-* only to trustworthy origins (https/localhost),
    //* so when the devserver is accessed over LAN the compiled catalog module requests
    //* get SSR'd into HTML and hydration fails with a MIME-type error. Mark them as
    //* script fetches before nitro's middleware (registered by the plugin below) runs.
    {
      name: "bitcart:serve-po-catalogs-over-lan",

      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url?.includes(".po?import")) req.headers["sec-fetch-dest"] = "script"

          next()
        })
      },
    },

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
          //* use-sync-external-store (pulled in by Base UI) is CJS-only. The SSR pass
          //* keeps react itself external (nitro bundles it later), so rolldown can't
          //* rewrite the CJS `require("react")` to an import and emits a runtime
          //* `__require("react")` that loads a second React copy from node_modules
          //* during prerender, crashing with a null-dispatcher TypeError. Externalize
          //* the package here so it reaches nitro's own bundling pass as raw CJS —
          //* there react IS bundled, so nitro rewires `require("react")` to the shared
          //* instance. Requires use-sync-external-store as a direct dependency, or the
          //* nitro pass can't resolve the externalized import under pnpm.
          external: [/^use-sync-external-store(\/|$)/],
        },
      },
    },
  },

  resolve: {
    tsconfigPaths: true,

    alias: {
      tslib: "tslib/tslib.es6.js",

      //* Nitro adds the `unwasm` resolve condition to the SSR environment, which makes
      //* "shiki/wasm" (imported by fumadocs-core's unused wasm engine factory) resolve to
      //* the raw onig.wasm binary that vite's wasm-fallback plugin refuses to bundle.
      //* Pinning it to the JS wrapper the `default` condition would pick anyway.
      "shiki/wasm": "shiki/dist/wasm.mjs",
    },
  },
})
