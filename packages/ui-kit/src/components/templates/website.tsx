import type { LocaleId } from "@bitcart/core/utils"
import { useMemo } from "react"

import { useLayoutConfigMemo } from "@/hooks/layout-config"
import { ThemeProvider } from "@/providers"
import type { BasicLinkComponent, BasicNavigationLink, LayoutConfig } from "@/types"
import { cn, getLayoutRegionNavigationDirectory } from "@/utils"

import { LocaleSelector, type LocaleSelectorProps } from "../molecules/locale-selector"
import { Toaster } from "../molecules/toaster"
import { WebsiteFooter } from "../organisms/website-footer"
import { WebsiteHeader } from "../organisms/website-header"

export type WebsiteLayoutProps<TSupportedLocaleId extends LocaleId> = {
  LinkComponent: BasicLinkComponent
  currentRoutePath?: BasicNavigationLink["href"]
  config: LayoutConfig
  localeChangeHandler: LocaleSelectorProps<TSupportedLocaleId>["handleSelect"]

  classNames?: {
    root?: string
  }

  children: React.ReactNode
}

export const WebsiteLayout = <TSupportedLocaleId extends LocaleId>({
  LinkComponent: Link,
  currentRoutePath,
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

  const headerNavDirectory = useMemo(
    () => getLayoutRegionNavigationDirectory("header", navigationDirectory),
    [navigationDirectory],
  )

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
      </>
    ),

    [i18n.activeLocale, i18n.availableLocales, localeChangeHandler],
  )

  return (
    <ThemeProvider>
      <div className={cn("bg-background flex min-h-screen flex-col", classNames?.root)}>
        <WebsiteHeader
          LinkComponent={Link}
          activeNavlinkHref={currentRoutePath}
          brandAttributes={brand}
          layoutControls={headerLayoutControls}
          maxVisibleNavBarLinks={navBarDisplayCapacity}
          navigationDirectory={headerNavDirectory}
        />

        {children}

        <WebsiteFooter
          LinkComponent={Link}
          brandAttributes={brand}
          homepageHref={rootRoutePath}
          navigationDirectory={footerNavDirectory}
        />
      </div>

      <Toaster position="top-center" />
    </ThemeProvider>
  )
}
