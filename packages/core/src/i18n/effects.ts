import { entries, keys } from "remeda"

import type { LazyLocaleModuleCatalog, LocaleMessages } from "./types"

const getLocaleIdFromModulePath = (modulePath: string) =>
  modulePath.slice(modulePath.lastIndexOf("/") + 1, -".po".length)

/**
 * Builds a locale loader over a lazy catalog produced by `import.meta.glob`.
 */
export const createLocaleLoader = (
  moduleCatalog: LazyLocaleModuleCatalog,
): ((locale: string) => Promise<LocaleMessages>) => {
  const moduleLoaders = new Map(
    entries(moduleCatalog).map(([modulePath, moduleLoader]) => [
      getLocaleIdFromModulePath(modulePath),
      moduleLoader,
    ]),
  )

  return async function loadLocale(locale: string): Promise<LocaleMessages> {
    const moduleLoader = moduleLoaders.get(locale)

    if (!moduleLoader) {
      throw new Error(`Locale module not found for ${locale}`)
    }

    const { messages } = await moduleLoader()

    console.info(`[i18n] Loaded locale ${locale} with ${keys(messages).length} messages`)

    return messages
  }
}
