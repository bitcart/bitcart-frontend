import type { LocaleId, PseudoLocaleId } from "@bitcart/core/utils"
import { useIsClient } from "@bitcart/hooks"
import { LAYOUT_CONTAINER_TESTID } from "@bitcart/qa"
import { t } from "@lingui/core/macro"

import { useCurrentBreakpoint, useSoftKeyboardTracker } from "@/hooks"
import { LayoutContextProvider, ThemeProvider, type LayoutContextProviderProps } from "@/providers"
import { type LayoutConfig } from "@/types"
import { cn } from "@/utils"

import { LinkButton } from "../atoms/link-button"
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

  useSoftKeyboardTracker()

  return (
    <LayoutContextProvider isHydrated={isHydrated} layoutConfig={config} {...props}>
      <ThemeProvider>
        <div
          className={cn("bg-background flex min-h-screen flex-col", classNames?.root)}
          data-is-hydrated={isHydrated}
          data-testid={LAYOUT_CONTAINER_TESTID}
        >
          <LinkButton
            id="main-content-link"
            href="#main-content"
            size="xl"
            className={cn(`
              focus:bottom-3
              md:focus:top-3
              focus:left-4
              md:focus:left-6 md:focus:h-10
              lg:focus:left-8
              important:px-6 important:py-3
              focus:important:fixed
              transition-scale sr-only
              focus:z-50
              focus-visible:not-sr-only focus-visible:ring-3
            `)}
          >
            {t`Skip to main content`}
          </LinkButton>

          <WebsiteMobileMenu
            layoutControls={<LocaleSelector handleSelect={localeChangeHandler} />}
            triggerSize="fab"
            triggerVariant="fab"
            classNames={{
              trigger: `
                md:hidden fixed z-40 bottom-[calc(env(safe-area-inset-bottom,0px)+var(--spacing)*4)]
                right-4
                [:root[data-soft-keyboard]_&]:hidden
              `,
            }}
          />

          <WebsiteHeader className="max-md:hidden">
            <WebsiteNavigationMenu
              className="md:flex hidden"
              inert={isClient && currentBreakpoint === "sm"}
            />

            {isClient ? (
              <ThemeToggle className="max-md:hidden" />
            ) : (
              <ThemeToggleFallback className="max-md:hidden" />
            )}

            <LocaleSelector
              handleSelect={localeChangeHandler}
              classNames={{ trigger: "max-md:hidden" }}
            />
          </WebsiteHeader>

          <main id="main-content" className="md:pt-16 flex-1 focus:outline-none" tabIndex={-1}>
            {children}
          </main>

          <WebsiteFooter classNames={{ root: "max-md:pb-16" }} />
        </div>

        <Toaster position="top-center" />
      </ThemeProvider>
    </LayoutContextProvider>
  )
}
