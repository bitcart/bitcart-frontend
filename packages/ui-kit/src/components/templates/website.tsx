import type { LocaleId, PseudoLocaleId } from "@bitcart/core/utils"
import { LAYOUT_CONTAINER_TESTID } from "@bitcart/qa"
import { useIsClient } from "usehooks-ts"

import { useCurrentBreakpoint } from "@/hooks"
import { LayoutContextProvider, ThemeProvider, type LayoutContextProviderProps } from "@/providers"
import { type LayoutConfig } from "@/types"
import { cn } from "@/utils"

import { ThemeToggle, ThemeToggleFallback } from "../molecules/theme-toggle"
import { Toaster } from "../molecules/toaster"
import { LocaleSelector, type LocaleSelectorProps } from "../organisms/locale-selector"
import { WebsiteFooter } from "../organisms/website-footer"
import { WebsiteHeader } from "../organisms/website-header"
import { WebsiteMobileMenu } from "../organisms/website-mobile-menu"
import { WebsiteNavigationMenu } from "../organisms/website-navigation-menu"

export type WebsiteLayoutProps<TSupportedLocaleId extends LocaleId | PseudoLocaleId> = Omit<
  LayoutContextProviderProps,
  "layoutConfig"
> & {
  config: LayoutConfig
  localeChangeHandler: LocaleSelectorProps<TSupportedLocaleId>["handleSelect"]

  classNames?: {
    root?: string
  }
}

export const WebsiteLayout = <TSupportedLocaleId extends LocaleId | PseudoLocaleId>({
  config,
  isHydrated,
  localeChangeHandler,
  classNames,
  children,
  ...props
}: WebsiteLayoutProps<TSupportedLocaleId>) => {
  const isClient = useIsClient()
  const currentBreakpoint = useCurrentBreakpoint()

  return (
    <LayoutContextProvider isHydrated={isHydrated} layoutConfig={config} {...props}>
      <ThemeProvider>
        <div
          className={cn("bg-background flex min-h-screen flex-col", classNames?.root)}
          data-is-hydrated={isHydrated}
          data-testid={LAYOUT_CONTAINER_TESTID}
        >
          <WebsiteHeader>
            <WebsiteNavigationMenu
              className="md:flex hidden"
              inert={isClient && currentBreakpoint === "sm"}
            />

            {isClient ? (
              <ThemeToggle className="max-md:hidden" />
            ) : (
              <ThemeToggleFallback className="max-md:hidden" />
            )}

            <LocaleSelector handleSelect={localeChangeHandler} />
            <WebsiteMobileMenu />
          </WebsiteHeader>

          <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
            {children}
          </main>

          <WebsiteFooter />
        </div>

        <Toaster position="top-center" />
      </ThemeProvider>
    </LayoutContextProvider>
  )
}
