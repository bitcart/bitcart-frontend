import type { Plugin } from "vite"

//* Nitro's dev middleware routes each request either to Vite or to SSR based on the
//* sec-fetch-dest header, falling back to an extension allowlist that doesn't know
//* `.po`. Browsers send sec-fetch-* only to trustworthy origins (https/localhost),
//* so when the devserver is accessed over LAN the compiled catalog module requests
//* get SSR'd into HTML and hydration fails with a MIME-type error. Mark them as
//* script fetches before nitro's middleware runs: register this plugin before `nitro()`.
export const serveLinguiCatalogsOverLan = (): Plugin => ({
  name: "bitcart:serve-po-catalogs-over-lan",

  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url?.includes(".po?import")) req.headers["sec-fetch-dest"] = "script"

      next()
    })
  },
})

//! TanStack Start's prerender never awaits its page tasks, so a page that fails to render
//! surfaces as an unhandled rejection (https://github.com/TanStack/router/issues/8120). Nitro's
//! runtime traps those and only logs them, so the build exits 0 without that page. Remove once a
//! fix ships.
export const failBuildOnPrerenderError = (): Plugin => ({
  name: "bitcart:fail-build-on-prerender-error",
  apply: "build",

  config() {
    process.on("unhandledRejection", (error) => {
      console.error(error)
      process.exitCode = 1
    })
  },
})

//* use-sync-external-store (pulled in by Base UI) is CJS-only. The SSR pass keeps react
//* itself external (nitro bundles it later), so rolldown can't rewrite the CJS
//* `require("react")` to an import and emits a runtime `__require("react")` that loads a
//* second React copy from node_modules during prerender, crashing with a null-dispatcher
//* TypeError. Externalizing the package here lets it reach nitro's own bundling pass as raw
//* CJS: there react IS bundled, so nitro rewires `require("react")` to the shared instance.
//! The app must list use-sync-external-store as a direct dependency, or the nitro pass can't
//! resolve the externalized import under pnpm.
export const nitroSsrExternalCjsPackages: RegExp[] = [/^use-sync-external-store(\/|$)/]

//* Nitro adds the `unwasm` resolve condition to the SSR environment, which makes
//* "shiki/wasm" (imported by fumadocs-core's unused wasm engine factory) resolve to the raw
//* onig.wasm binary that vite's wasm-fallback plugin refuses to bundle. Pinning it to the JS
//* wrapper the `default` condition would pick anyway.
export const nitroFumadocsResolveAliases: Record<string, string> = {
  "shiki/wasm": "shiki/dist/wasm.mjs",
}
