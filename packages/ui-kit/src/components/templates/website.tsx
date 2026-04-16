import type { LocaleId, PseudoLocaleId } from "@bitcart/core/utils"
import { LAYOUT_CONTAINER_TESTID } from "@bitcart/qa"
import { useMemo } from "react"

import { useLayoutConfigMemo } from "@/hooks/layout-config"
import { LinkComponentProvider, ThemeProvider } from "@/providers"
import {
  type BasicLinkComponent,
  type BasicNavigationLink,
  type LayoutConfig,
  type NavigationCatalog,
} from "@/types"
import { cn, extractNavigationCatalog, getLayoutRegionNavigationDirectory } from "@/utils"

import { Toaster } from "../molecules/toaster"
import { LocaleSelector, type LocaleSelectorProps } from "../organisms/locale-selector"
import { WebsiteFooter } from "../organisms/website-footer"
import { WebsiteHeader } from "../organisms/website-header"
import { WebsiteMobileMenu } from "../organisms/website-mobile-menu"

export type WebsiteLayoutProps<TSupportedLocaleId extends LocaleId | PseudoLocaleId> = {
  LinkComponent: BasicLinkComponent
  currentRoutePath?: BasicNavigationLink["href"]
  config: LayoutConfig
  isHydrated: boolean
  localeChangeHandler: LocaleSelectorProps<TSupportedLocaleId>["handleSelect"]

  classNames?: {
    root?: string
  }

  children: React.ReactNode
}

export const WebsiteLayout = <TSupportedLocaleId extends LocaleId | PseudoLocaleId>({
  LinkComponent: Link,
  currentRoutePath,
  isHydrated,
  localeChangeHandler,
  classNames,
  children,
  ...props
}: WebsiteLayoutProps<TSupportedLocaleId>) => {
  const {
    i18n,
    brand,
    navigation: { rootRoutePath, navBarDisplayCapacity, directory: navigationDirectory },
  } = useLayoutConfigMemo(props.config)

  /**
   * Links from all navigation groups merged into a single array
   * and ordered by global priority.
   */
  const mainNavCatalog: NavigationCatalog = useMemo(
    () =>
      extractNavigationCatalog(getLayoutRegionNavigationDirectory("header", navigationDirectory)),

    [navigationDirectory],
  )

  /**
   * All navigation groups containing only the links relevant for the footer.
   */
  const footerNavDirectory = useMemo(
    () => getLayoutRegionNavigationDirectory("footer", navigationDirectory),
    [navigationDirectory],
  )

  const headerLayoutControls = useMemo(
    () => (
      <>
        <LocaleSelector
          activeLocaleId={i18n.activeLocale as TSupportedLocaleId}
          handleSelect={localeChangeHandler}
          optionLocaleIds={i18n.availableLocales as TSupportedLocaleId[]}
        />

        <WebsiteMobileMenu
          LinkComponent={Link}
          activeHref={currentRoutePath}
          brandAttributes={brand}
          homepageHref={rootRoutePath}
          navigationCatalog={mainNavCatalog}
        />
      </>
    ),

    [
      Link,
      brand,
      currentRoutePath,
      i18n.activeLocale,
      i18n.availableLocales,
      localeChangeHandler,
      mainNavCatalog,
      rootRoutePath,
    ],
  )

  return (
    <LinkComponentProvider LinkComponent={Link}>
      <ThemeProvider>
        <div
          className={cn("bg-background flex min-h-screen flex-col", classNames?.root)}
          data-is-hydrated={isHydrated}
          data-testid={LAYOUT_CONTAINER_TESTID}
        >
          <WebsiteHeader
            LinkComponent={Link}
            activeNavlinkHref={currentRoutePath}
            brandAttributes={brand}
            layoutControls={headerLayoutControls}
            maxVisibleNavBarLinks={navBarDisplayCapacity}
            navigationCatalog={mainNavCatalog}
          />

          <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
            {children}
          </main>

          <WebsiteFooter
            LinkComponent={Link}
            brandAttributes={brand}
            homepageHref={rootRoutePath}
            navigationDirectory={footerNavDirectory}
          />
        </div>

        <Toaster position="top-center" />
      </ThemeProvider>
    </LinkComponentProvider>
  )
}
