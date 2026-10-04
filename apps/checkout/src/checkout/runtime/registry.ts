import { i18n as globalI18n, type I18n, type Messages } from "@lingui/core"

import type { CheckoutTemplate } from "../template"

type CheckoutTemplateModuleLoader = () => Promise<{ default: CheckoutTemplate }>

type CheckoutTemplateCatalogLoader = () => Promise<{ messages: Messages }>

const CATALOG_MODULE_PATH_PATTERN = /\/templates\/(?<id>[^/]+)\/locales\/(?<locale>[^/]+)\.po$/u

const TEMPLATE_MODULE_PATH_PATTERN = /\/templates\/(?<id>[^/]+)\/index\.tsx?$/u

const KEBAB_CASE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u

const getTemplateId = (modulePath: string): string => {
  const id = TEMPLATE_MODULE_PATH_PATTERN.exec(modulePath)?.groups?.id

  if (!id) {
    throw new Error(`"${modulePath}" is not a checkout template entry`)
  } else if (!KEBAB_CASE_PATTERN.test(id)) {
    throw new Error(`Checkout template folder "${id}" must be named in kebab-case`)
  } else return id
}

const createLoadCache = <T>() => {
  const entries = new Map<string, { promise: Promise<T>; isLoaded: boolean }>()

  const load = (key: string, loader: () => Promise<T>): Promise<T> => {
    const cached = entries.get(key)

    if (cached) {
      return cached.promise
    } else {
      const entry = {
        isLoaded: false,

        promise: loader().then(
          (value) => {
            entry.isLoaded = true

            return value
          },

          (error: unknown) => {
            entries.delete(key)
            throw error
          },
        ),
      }

      entries.set(key, entry)

      return entry.promise
    }
  }

  return { load, isLoaded: (key: string) => entries.get(key)?.isLoaded ?? false }
}

export type CheckoutTemplateResolveParams = {
  requested?: string | undefined
  stored?: string | null | undefined
  allowRequested: boolean
}

const indexCatalogs = (catalogs: Record<string, CheckoutTemplateCatalogLoader>) =>
  new Map(
    Object.entries(catalogs).map(([modulePath, loader]) => {
      const { id, locale } = CATALOG_MODULE_PATH_PATTERN.exec(modulePath)?.groups ?? {}

      if (!id || !locale) {
        throw new Error(`"${modulePath}" is not a checkout template catalog`)
      } else return [`${id}/${locale}`, loader]
    }),
  )

export const createTemplateRegistry = (
  modules: Record<string, CheckoutTemplateModuleLoader>,
  {
    defaultId,
    catalogs = {},
    i18n = globalI18n,
  }: {
    defaultId: string
    catalogs?: Record<string, CheckoutTemplateCatalogLoader>
    i18n?: I18n
  },
) => {
  const loaders = new Map(
    Object.entries(modules).map(([modulePath, loader]) => [getTemplateId(modulePath), loader]),
  )

  if (!loaders.has(defaultId)) {
    throw new Error(`The default checkout template "${defaultId}" is not registered`)
  }

  const templateCache = createLoadCache<CheckoutTemplate>()
  const catalogCache = createLoadCache<void>()
  const renderedCatalogCache = createLoadCache<void>()
  const catalogLoaders = indexCatalogs(catalogs)

  const load = (id: string): Promise<CheckoutTemplate> => {
    const loader = loaders.get(id)

    if (!loader) {
      throw new Error(`Unknown checkout template "${id}"`)
    } else return templateCache.load(id, async () => (await loader()).default)
  }

  const loadCatalog = (id: string, locale: string): Promise<void> =>
    catalogCache.load(`${id}/${locale}`, async () => {
      const loader = catalogLoaders.get(`${id}/${locale}`)
      const messages = loader ? (await loader()).messages : (await load(id)).sourceMessages

      if (messages) {
        i18n.load(locale, messages)
      }
    })

  /**
   * Loads a catalog for rendering and never rejects.
   *
   * A failed load is logged and marks the locale as settled: the template then renders its bundled
   * source messages.
   */
  const settleCatalog = (id: string, locale: string): Promise<void> =>
    renderedCatalogCache.load(`${id}/${locale}`, () =>
      loadCatalog(id, locale).catch(async (error: unknown) => {
        const { sourceMessages } = await load(id)

        console.error(
          `Checkout template "${id}" failed to load its "${locale}" catalog and renders its source messages`,
          error,
        )

        if (sourceMessages) {
          i18n.load(locale, sourceMessages)
        }
      }),
    )

  const isCatalogSettled = (id: string, locale: string): boolean =>
    catalogCache.isLoaded(`${id}/${locale}`) || renderedCatalogCache.isLoaded(`${id}/${locale}`)

  const resolve = ({ requested, stored, allowRequested }: CheckoutTemplateResolveParams): string =>
    [allowRequested ? requested : undefined, stored].find(
      (id): id is string => typeof id === "string" && loaders.has(id),
    ) ?? defaultId

  return {
    ids: [...loaders.keys()],
    defaultId,
    load,
    loadCatalog,
    settleCatalog,
    isCatalogSettled,
    resolve,
  }
}

export type CheckoutTemplateRegistry = ReturnType<typeof createTemplateRegistry>
