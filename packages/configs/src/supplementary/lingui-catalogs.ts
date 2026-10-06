import { relative } from "node:path"

import {
  createCompilationErrorMessage,
  createCompiledCatalog,
  getCatalogForFile,
  getCatalogs,
} from "@lingui/cli/api"
import type { LinguiConfigNormalized } from "@lingui/conf"
import type { Rolldown } from "tsdown"

/**
 * Compiles imported `.po` catalogs into ES modules exporting `messages`, as the Lingui Vite plugin
 * does for apps. Unlike that plugin, it takes the Lingui config as an argument and runs in tsdown.
 */
export const linguiCatalogsPlugin = (linguiConfig: LinguiConfigNormalized): Rolldown.Plugin => ({
  name: "bitcart:lingui-catalogs",

  load: {
    filter: { id: /\.po$/ },

    handler: async (id) => {
      const fileCatalog = getCatalogForFile(
        relative(linguiConfig.rootDir, id),
        await getCatalogs(linguiConfig),
      )

      if (!fileCatalog) {
        throw new Error(`${id} matches none of the catalog paths in the Lingui config`)
      }

      const { locale, catalog } = fileCatalog

      const { messages } = await catalog.getTranslations(locale, {
        fallbackLocales: linguiConfig.fallbackLocales,
        sourceLocale: linguiConfig.sourceLocale,
      })

      const pseudoLocale = linguiConfig.pseudoLocale.find((config) => config.locale === locale)

      const { source, errors } = createCompiledCatalog(locale, messages, {
        namespace: "es",
        pseudoLocale: pseudoLocale?.locale,
        pseudoLocaleOptions: pseudoLocale?.options,
      })

      if (errors.length > 0) {
        throw new Error(createCompilationErrorMessage(locale, errors))
      } else return { code: source, moduleType: "js" }
    },
  },
})
