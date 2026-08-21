import { getDocumentHeadManifest, getPageDocumentMetadata } from "@bitcart/core/metadata"
import { useIsClient } from "@bitcart/hooks"
import { LayoutContainer } from "@bitcart/ui-kit/components"
import { LayoutContextProvider, ThemeProvider } from "@bitcart/ui-kit/providers"
import { cn } from "@bitcart/ui-kit/utils"
import { i18n as globalI18n } from "@lingui/core"
import { useLingui } from "@lingui/react"
import { TanStackDevtools } from "@tanstack/react-devtools"
import type { QueryClient } from "@tanstack/react-query"
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

import { APP_POSIX_LOCALE_ID_MAP, getAppDocumentMetadata, SUPPORTED_LOCALE_IDS } from "#/app.config"
import { BRAND_X_HANDLE, PRODUCTION_BASE_URL, PROJECT_CANONICAL_NAME } from "#/common/constants"
import { useI18nInitialization } from "#/common/i18n"
import { TanStackQueryDevtools } from "#/common/integrations/tanstack-query"
import { Link, useClientRoute } from "#/common/navigation"

import { getLayoutConfig } from "./-layout/config"

import unoCss from "./-layout/uno.generated.css?url"

interface CheckoutRouterContext {
  queryClient: QueryClient
}

const isServer = typeof document === "undefined"

export const Route = createRootRouteWithContext<CheckoutRouterContext>()({
  head: ({ match, matches }) => {
    //* Prevents permanently baking in the static `/i/_shell` at prerender time.
    const routePath = isServer ? "/" : (matches[matches.length - 1]?.pathname ?? match.pathname)

    const metadata = getPageDocumentMetadata({
      baseUrl: PRODUCTION_BASE_URL,
      localeId: globalI18n.locale,
      posixLocaleIdMap: APP_POSIX_LOCALE_ID_MAP,
      routePath,
      staticParams: getAppDocumentMetadata(),
      supportedLocaleIds: SUPPORTED_LOCALE_IDS,
    })

    const manifest = getDocumentHeadManifest({
      isCharsetSetElsewhere: false,
      isOgTitleSetElsewhere: false,
      isRoutingLocaleDependent: false,
      metadata,
      ogSiteName: PROJECT_CANONICAL_NAME,
      posixLocaleIdMap: APP_POSIX_LOCALE_ID_MAP,
      routePath,
      twitterHandles: { author: BRAND_X_HANDLE, site: BRAND_X_HANDLE },
    })

    return {
      meta: [{ title: metadata.title }, ...manifest.meta],
      links: [{ rel: "stylesheet", href: unoCss }, ...manifest.links],
    }
  },

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { i18n } = useLingui()
  const currentRoute = useClientRoute()
  const isClient = useIsClient()

  useI18nInitialization()

  return (
    <html lang={i18n.locale} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>

      <body
        className={cn(`
          font-sans bg-background text-foreground
          selection:bg-primary/25
          wrap-anywhere antialiased
        `)}
      >
        <ThemeProvider>
          <LayoutContextProvider
            LinkComponent={Link}
            currentRoute={currentRoute}
            isHydrated={isClient}
            layoutConfig={getLayoutConfig()}
          >
            <LayoutContainer
              className={cn(`bg-muted/40 p-4 flex min-h-screen items-center justify-center`)}
            >
              {children}
            </LayoutContainer>
          </LayoutContextProvider>

          <TanStackDevtools
            config={{ position: "bottom-right" }}
            plugins={[
              { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
              TanStackQueryDevtools,
            ]}
          />
        </ThemeProvider>

        <Scripts />
      </body>
    </html>
  )
}
