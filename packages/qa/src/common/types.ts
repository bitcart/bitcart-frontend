import type { InternalHref } from "@bitcart/core/navigation"

export type PageRoutePath = string

export type PageRegistryEntry = { path: PageRoutePath; name: string }

export type PageRegistry = Record<PageRoutePath, PageRegistryEntry>

/**
 * File-routing convention the page registry should interpret.
 *
 * - `vike` — the route comes from the directory structure, the page file has a
 *   fixed name (`+Page.tsx`).
 * - `tanstack-router` — the route comes from the route file's own path, with `.`
 *   acting as a path separator.
 */
export type PageRoutingConvention = "vike" | "tanstack-router"

export type PageRegistryParams =
  | {
      convention?: "vike"
      pagesSrcDir: string
      pageFileName: string | RegExp
    }
  | {
      convention: "tanstack-router"
      pagesSrcDir: string

      /**
       * Defaults to any `.js`/`.jsx`/`.ts`/`.tsx` file.
       */
      pageFileName?: string | RegExp
    }

export type PageCatalog = PageRegistryEntry[]

export interface WithPageCatalog {
  pageCatalog: PageCatalog
}

export interface WithPageRegistry {
  pageRegistry: PageRegistry
}

export interface WithTestRoute {
  /**
   * Route the test navigates to. Defaults to the homepage.
   */
  testRoute?: InternalHref
}
