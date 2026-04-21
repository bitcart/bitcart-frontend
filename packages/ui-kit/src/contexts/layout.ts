import type { InternalHref, RouteBindings } from "@bitcart/core/types"
import { createContext } from "react"

import type {
  BasicLinkComponent,
  LayoutConfig,
  LayoutNavigationConfig,
  NavigationCatalog,
} from "@/types"

export type LayoutContextValue = {
  Link: BasicLinkComponent
  currentRoute: RouteBindings
  isHydrated: boolean

  layoutConfig: LayoutConfig & {
    navigation: Omit<LayoutNavigationConfig, "rootRoutePathname"> & {
      rootRoutePathname: InternalHref
    }
  }

  primaryNavCatalog: NavigationCatalog
}

export const LayoutContext = createContext<LayoutContextValue | null>(null)
