import type { CheckoutTemplate } from "../template"

type CheckoutTemplateModuleLoader = () => Promise<{ default: CheckoutTemplate }>

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

export type CheckoutTemplateResolveParams = {
  requested?: string | undefined
  stored?: string | null | undefined
  allowRequested: boolean
}

export const createTemplateRegistry = (
  modules: Record<string, CheckoutTemplateModuleLoader>,
  { defaultId }: { defaultId: string },
) => {
  const loaders = new Map(
    Object.entries(modules).map(([modulePath, loader]) => [getTemplateId(modulePath), loader]),
  )

  if (!loaders.has(defaultId)) {
    throw new Error(`The default checkout template "${defaultId}" is not registered`)
  }

  const loadedTemplates = new Map<string, Promise<CheckoutTemplate>>()

  const load = (id: string): Promise<CheckoutTemplate> => {
    const loader = loaders.get(id)

    if (!loader) {
      throw new Error(`Unknown checkout template "${id}"`)
    } else {
      const template =
        loadedTemplates.get(id) ??
        loader().then(
          (module) => module.default,

          //* Evicts a failed load from the cache: a retry fetches the chunk again.
          (error: unknown) => {
            loadedTemplates.delete(id)
            throw error
          },
        )

      loadedTemplates.set(id, template)

      return template
    }
  }

  const resolve = ({ requested, stored, allowRequested }: CheckoutTemplateResolveParams): string =>
    [allowRequested ? requested : undefined, stored].find(
      (id): id is string => typeof id === "string" && loaders.has(id),
    ) ?? defaultId

  return { ids: [...loaders.keys()], defaultId, load, resolve }
}

export type CheckoutTemplateRegistry = ReturnType<typeof createTemplateRegistry>
