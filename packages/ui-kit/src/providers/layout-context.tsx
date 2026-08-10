import { useEffect, useMemo, useState } from "react"

import { LayoutContext, type LayoutContextValue } from "@/contexts/layout"
import type { LayoutConfig, NavigationCatalog } from "@/types"
import { extractNavigationCatalog, getLayoutRegionNavigationDirectory } from "@/utils"

export type LayoutContextProviderProps = Omit<
  LayoutContextValue,
  "Link" | "currentRoute" | "isHydrated" | "layoutConfig" | "primaryNavCatalog"
> & {
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
   * **Must be the result of `getLayoutConfig()`.**
   */
  layoutConfig: LayoutConfig

  children: React.ReactNode
}

export const LayoutContextProvider: React.FC<LayoutContextProviderProps> = ({
  LinkComponent,
  isHydrated = true,
  layoutConfig: nonMemoizedLayoutConfig,
  children,
  ...props
}) => {
  const [layoutConfig, setMemoizedConfig] = useState(nonMemoizedLayoutConfig)

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
      ...props,
      Link: LinkComponent,
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

    [LinkComponent, isHydrated, layoutConfig, primaryNavCatalog, props],
  )

  useEffect(() => {
    //! Make sure to preserve this condition as it prevents rerender loops
    if (layoutConfig.i18n.activeLocale !== nonMemoizedLayoutConfig.i18n.activeLocale) {
      // oxlint-disable-next-line react-hooks-js/set-state-in-effect
      setMemoizedConfig(nonMemoizedLayoutConfig)
    }
  }, [layoutConfig.i18n.activeLocale, nonMemoizedLayoutConfig])

  return <LayoutContext.Provider value={contextValue}>{children}</LayoutContext.Provider>
}
