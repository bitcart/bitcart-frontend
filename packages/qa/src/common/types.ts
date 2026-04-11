export type PageRoutePath = string

export type PageRegistryEntry = { path: PageRoutePath; name: string }

export type PageRegistry = Record<PageRoutePath, PageRegistryEntry>

export type PageRegistryParams = { pagesSrcDir: string; pageFileName: string | RegExp }

export type PageCatalog = PageRegistryEntry[]

export interface WithPageCatalog {
  pageCatalog: PageCatalog
}

export interface WithPageRegistry {
  pageRegistry: PageRegistry
}
