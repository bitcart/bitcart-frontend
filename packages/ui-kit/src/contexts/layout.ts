import type { InternalHref, ClientRoute } from "@bitcart/core/navigation"
import { createContext } from "react"

import type {
  BasicLinkComponent,
  LayoutConfig,
  LayoutNavigationConfig,
  NavigationCatalog,
} from "@/types"

export type LayoutContextValue = {
  /**
   * The link component provided by the application's routing library.
   */
  Link: BasicLinkComponent

  /**
   * A framework-agnostic router binding that provides basic route context (pathname and hash)
   * to the abstract layout components beneath, e.g. for computing active-link state.
   */
  currentRoute: ClientRoute

  /**
   * A hydration flag for SSR-sensitive components. Always `true` in CSR environments.
   */
  isHydrated: boolean

  /**
   * The application's declarative layout configuration: brand identity,
   * basic localization metadata, and the navigation link groups.
   */
  layoutConfig: LayoutConfig & {
    navigation: Omit<LayoutNavigationConfig, "rootRoutePathname"> & {
      rootRoutePathname: InternalHref
    }
  }

  /**
   * Derived from the navigation directory: the primary set of links for those layout regions
   * that stay within reach regardless of the current route, with a header
   * or a mobile main menu being the canonical examples of such a region.
   *
   * Essentially contains all links that do not have the `footerOnly` flag set to `true`.
   */
  primaryNavCatalog: NavigationCatalog
}

export const LayoutContext = createContext<LayoutContextValue | null>(null)
