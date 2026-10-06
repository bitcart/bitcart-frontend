import { useMemo } from "react"

import { LayoutContext, type LayoutContextValue } from "@/contexts/layout"
import type { LayoutConfig, NavigationCatalog } from "@/types"
import { extractNavigationCatalog, getLayoutRegionNavigationDirectory } from "@/utils"

export type LayoutContextProviderProps = {
  /**
   * The link component used by some of the UI Kit components internally to render
   * navigable links without depending on any particular routing library on their own.
   *
   * **Must be provided by the application's routing library.**
   */
  LinkComponent: LayoutContextValue["Link"]

  /**
   * A framework-agnostic router binding that provides basic route context (pathname and hash)
   * to the abstract layout components beneath, e.g. for computing active-link state.
   *
   * **Must be provided by the application's routing library.**
   */
  currentRoute: LayoutContextValue["currentRoute"]

  /**
   * A hydration flag for SSR-sensitive components. In SSR environments, it must be provided
   * by the application framework as a reactive value.
   *
   * **Do not set in CSR environments.**
   *
   * @default true
   */
  isHydrated?: boolean

  /**
   * The application's declarative layout configuration: brand identity,
   * basic localization metadata, and the navigation link groups.
   *
   * **Must be the result of `getLayoutConfig()`**, memoized on the factory's arguments, e.g.
   * `useMemo(() => getLayoutConfig(i18n), [i18n])`: every new object rerenders the layout.
   */
  layoutConfig: LayoutConfig

  children: React.ReactNode
}

export const LayoutContextProvider: React.FC<LayoutContextProviderProps> = ({
  LinkComponent,
  currentRoute,
  isHydrated = true,
  layoutConfig,
  children,
}) => {
  /**
   * Links from all primary navigation groups merged into a single array
   * and ordered by global priority.
   */
  const primaryNavCatalog: NavigationCatalog = useMemo(
    () =>
      extractNavigationCatalog(
        getLayoutRegionNavigationDirectory("header", layoutConfig.navigation.directory),
      ),

    [layoutConfig.navigation.directory],
  )

  const contextValue: LayoutContextValue = useMemo(
    () => ({
      Link: LinkComponent,
      currentRoute,
      isHydrated,

      layoutConfig: {
        ...layoutConfig,

        navigation: {
          ...layoutConfig.navigation,
          rootRoutePathname: layoutConfig.navigation.rootRoutePathname ?? "/",
        },
      },

      primaryNavCatalog,
    }),

    [LinkComponent, currentRoute, isHydrated, layoutConfig, primaryNavCatalog],
  )

  return <LayoutContext.Provider value={contextValue}>{children}</LayoutContext.Provider>
}
