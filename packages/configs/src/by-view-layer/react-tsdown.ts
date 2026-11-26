import { transform } from "oxc-transform-react"
import type { Rolldown } from "tsdown"

//* The prefilter `@vitejs/plugin-react` applies before handing a module to React Compiler.
const MAY_DEFINE_COMPONENT_OR_HOOK = /forwardRef|memo|\b(?:[A-Z]|use[A-Z0-9])/

export const reactCompilerPlugin = (): Rolldown.Plugin => ({
  name: "bitcart:react-compiler",

  transform: {
    filter: {
      id: { include: /\.[cm]?[jt]sx?$/, exclude: [/[\\/]node_modules[\\/]/, /\.d\.[cm]?ts$/] },
      code: MAY_DEFINE_COMPONENT_OR_HOOK,
    },

    async handler(code, id) {
      const result = await transform(id, code, {
        jsx: "preserve",
        reactCompiler: { target: "19" },
        sourcemap: true,
      })

      const diagnostics = result.errors.map((error) =>
        error.codeframe ? `${error.message}\n${error.codeframe}` : error.message,
      )

      if (result.fatal) {
        return this.error(diagnostics.join("\n\n") || `React Compiler failed on ${id}`)
      } else {
        for (const diagnostic of diagnostics) this.warn(diagnostic)

        return { code: result.code, map: result.map }
      }
    },
  },
})
