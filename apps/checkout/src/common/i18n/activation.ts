import type { I18n, Messages } from "@lingui/core"

type CatalogLoader = (locale: string) => Promise<void>

/**
 * Switches the app's locale.
 *
 * Catalogs merge into a locale: catalogs loaded by other modules survive the switch. A switch
 * awaits every registered catalog loader before activating the new locale.
 */
export const createLocaleActivation = ({
  i18n,
  loadAppCatalog,
}: {
  i18n: I18n
  loadAppCatalog: (locale: string) => Promise<Messages>
}) => {
  const catalogLoaders = new Set<CatalogLoader>()

  const registerCatalogLoader = (loader: CatalogLoader): (() => void) => {
    catalogLoaders.add(loader)

    return () => {
      catalogLoaders.delete(loader)
    }
  }

  const activateLocale = async (locale: string): Promise<void> => {
    const [appMessages] = await Promise.all([
      loadAppCatalog(locale),

      //* A failed catalog must not block the switch: its owner loads it again when it renders.
      Promise.allSettled([...catalogLoaders].map((loader) => loader(locale))),
    ])

    i18n.load(locale, appMessages)
    i18n.activate(locale)
  }

  return { activateLocale, registerCatalogLoader }
}
