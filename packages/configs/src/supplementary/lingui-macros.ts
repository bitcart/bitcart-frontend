import { basename } from "node:path"

import type { LinguiConfigNormalized } from "@lingui/conf"
import { mapMacroOptions, transform, type LinguiMacroOptions } from "@lingui/native-tools"
import type { Rolldown } from "tsdown"

/**
 * Compiles Lingui macros with Lingui's native transform, taking the Lingui config as an argument.
 * `lingui({ macroTransform: true })` from `@lingui/vite-plugin` needs a Lingui config file and
 * Vite: its transform reads `this.environment`, which tsdown's Rolldown plugin context lacks.
 */
export const linguiMacrosPlugin = (
  linguiConfig: LinguiConfigNormalized,
  macroOptions?: Partial<LinguiMacroOptions>,
): Rolldown.Plugin => {
  const macroPackagePattern = [...linguiConfig.macro.corePackage, ...linguiConfig.macro.jsxPackage]
    .map((macroPackage) => RegExp.escape(macroPackage))
    .join("|")

  return {
    name: "bitcart:lingui-macros",

    transform: {
      filter: {
        id: /\.[cm]?[jt]sx?(?:$|\?)/,
        code: new RegExp(`from ["'](?:${macroPackagePattern})["']`),
      },

      handler: async (code, id) => {
        const { code: transformedCode, map } = await transform(code, basename(id.split("?")[0]), {
          macro: mapMacroOptions(linguiConfig, macroOptions),
        })

        return { code: transformedCode, map }
      },
    },
  }
}
