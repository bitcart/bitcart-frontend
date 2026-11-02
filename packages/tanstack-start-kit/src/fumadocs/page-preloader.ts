import { getSlugs } from "fumadocs-core/source/plugins/slugs"

export type PageCollection = {
  raw: Record<string, unknown>
}

export type PageClientLoader = {
  preload: (path: string) => Promise<unknown>
}

export type PagePreloader = (pathname: string) => Promise<void>

export const createPagePreloader = (
  collection: PageCollection,
  clientLoader: PageClientLoader,
  baseUrl = "/",
): PagePreloader => {
  const basePath = baseUrl.replace(/\/$/, "")

  const pagePathsByUrlPath = new Map(
    Object.keys(collection.raw).map((key) => {
      const path = key.replace(/^\.\//, "")

      return [getSlugs(path).join("/"), path]
    }),
  )

  return async (pathname) => {
    if (pathname === basePath || pathname.startsWith(`${basePath}/`)) {
      const path = pagePathsByUrlPath.get(pathname.slice(basePath.length).replace(/^\/|\/$/g, ""))

      if (path) await clientLoader.preload(path)
    }
  }
}
