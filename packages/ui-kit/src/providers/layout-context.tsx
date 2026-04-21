import { useEffect, useMemo, useState } from "react"

import { LayoutContext, type LayoutContextValue } from "@/contexts/layout"
import type { BasicLinkComponent, LayoutConfig, NavigationCatalog } from "@/types"
import { extractNavigationCatalog, getLayoutRegionNavigationDirectory } from "@/utils"

export type LayoutContextProviderProps = Omit<
  LayoutContextValue,
  "Link" | "layoutConfig" | "primaryNavCatalog"
> & {
  LinkComponent: BasicLinkComponent
  layoutConfig: LayoutConfig
  children: React.ReactNode
}

export const LayoutContextProvider: React.FC<LayoutContextProviderProps> = ({
  LinkComponent,
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

      layoutConfig: {
        ...layoutConfig,

        navigation: {
          ...layoutConfig.navigation,
          rootRoutePathname: layoutConfig.navigation.rootRoutePathname ?? "/",
        },
      },

      primaryNavCatalog,
    }),

    [LinkComponent, layoutConfig, primaryNavCatalog, props],
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
