import { SOURCE_LOCALE_ID, combineLocaleLoaders, type LocaleMessages } from "@bitcart/core/i18n"
import type { I18n } from "@lingui/core"

/**
 * A catalog the app always merges into its locales: a package's one or the app's own.
 */
export type LocaleCatalog = {
  /**
   * Bundled statically, so that prerendered pages and the first client render need no fetch.
   */
  sourceMessages: LocaleMessages
  loadMessages: (localeId: string) => Promise<LocaleMessages>
}

/**
 * Loads a catalog that only part of the app uses into the given locale.
 */
export type CatalogLoader = (localeId: string) => Promise<void>

export type LocaleActivation = {
  /**
   * Activates the statically bundled source catalogs. **Must be called before the router is created.**
   */
  activateSourceLocale: () => void

  /**
   * Loads every catalog for a locale, then activates it. Does nothing for the active locale.
   */
  activateLocale: (localeId: string) => Promise<void>

  /**
   * Makes every following switch await the loader too. Returns the function that unregisters it.
   */
  registerCatalogLoader: (loader: CatalogLoader) => () => void
}

/**
 * Switches an app's locale on its Lingui instance.
 *
 * Catalogs merge into a locale in the given order, so the app's own catalog goes last to override
 * the packages' ones. Catalogs loaded by registered loaders survive later switches.
 */
export const createLocaleActivation = ({
  i18n,
  catalogs,
}: {
  i18n: I18n
  catalogs: readonly LocaleCatalog[]
}): LocaleActivation => {
  const sourceMessages: LocaleMessages = Object.assign(
    {},
    ...catalogs.map((catalog) => catalog.sourceMessages),
  )

  const loadMessages = combineLocaleLoaders(...catalogs.map((catalog) => catalog.loadMessages))
  const catalogLoaders = new Set<CatalogLoader>()

  return {
    activateSourceLocale: () => {
      i18n.load(SOURCE_LOCALE_ID, sourceMessages)
      i18n.activate(SOURCE_LOCALE_ID)
    },

    activateLocale: async (localeId) => {
      if (i18n.locale === localeId) return void null

      const [messages] = await Promise.all([
        localeId === SOURCE_LOCALE_ID ? sourceMessages : loadMessages(localeId),

        //* A failed catalog must not block the switch: its owner loads it again when it renders.
        Promise.allSettled([...catalogLoaders].map((loader) => loader(localeId))),
      ])

      i18n.load(localeId, messages)
      i18n.activate(localeId)
    },

    registerCatalogLoader: (loader) => {
      catalogLoaders.add(loader)

      return () => {
        catalogLoaders.delete(loader)
      }
    },
  }
}
