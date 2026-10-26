import type { ServerResponse } from "node:http"
import { resolve } from "node:path"

import { build, type Connect, type Plugin } from "vite"

const EMBED_SCRIPTS: Record<string, string> = {
  "embed/v1.js": "src/embed/v1.ts",
  "modal/bitcart.js": "src/embed/modal.ts",
}

//! A page that declares no charset decodes the scripts it loads as windows-1252, garbling any
//! non-ASCII character.
const NON_ASCII_PATTERN = /\P{ASCII}/u

const bundleScript = async (root: string, entry: string, { minify }: { minify: boolean }) => {
  const result = await build({
    root,
    configFile: false,
    envDir: false,
    publicDir: false,
    logLevel: "warn",

    build: {
      write: false,
      minify,
      modulePreload: false,

      rolldownOptions: {
        input: resolve(root, entry),
        output: { format: "iife" },
      },
    },
  })

  const [output] = Array.isArray(result) ? result : [result]

  if (!output || !("output" in output)) {
    throw new Error(`Bundling ${entry} produced no output`)
  } else if (NON_ASCII_PATTERN.test(output.output[0].code)) {
    throw new Error(`${entry} bundles non-ASCII characters: escape them in the source`)
  } else return output.output[0].code
}

export const embedScripts = (): Plugin => {
  let root = ""

  return {
    name: "bitcart-embed-scripts",

    configResolved: (config) => {
      root = config.root
    },

    configureServer: (server) => {
      const serveScript = async (
        entry: string,
        response: ServerResponse,
        next: Connect.NextFunction,
      ) => {
        try {
          const code = await bundleScript(root, entry, { minify: false })

          response.setHeader("Content-Type", "text/javascript")
          response.setHeader("Cache-Control", "no-store")
          response.end(code)
        } catch (error) {
          next(error)
        }
      }

      server.middlewares.use((request, response, next) => {
        const entry = EMBED_SCRIPTS[request.url?.split("?")[0]?.slice(1) ?? ""]

        if (entry) {
          void serveScript(entry, response, next)
        } else next()
      })
    },

    async generateBundle() {
      if (this.environment.name === "client") {
        for (const [fileName, entry] of Object.entries(EMBED_SCRIPTS)) {
          this.emitFile({
            type: "asset",
            fileName,
            source: await bundleScript(root, entry, { minify: true }),
          })
        }
      }
    },
  }
}
