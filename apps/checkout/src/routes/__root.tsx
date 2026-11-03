import { useIsClient } from "@bitcart/hooks"
import { useI18nInitialization } from "@bitcart/tanstack-start-kit/i18n"
import { getDocumentHead, getFontPreloadLink } from "@bitcart/tanstack-start-kit/metadata"
import { Link, useClientRoute } from "@bitcart/tanstack-start-kit/navigation"
import { LayoutContainer, Toaster } from "@bitcart/ui-kit/components"
import { LayoutContextProvider, ThemeProvider } from "@bitcart/ui-kit/providers"
import { cn } from "@bitcart/ui-kit/utils"
import { i18n as globalI18n } from "@lingui/core"
import { useLingui } from "@lingui/react"
import { TanStackDevtools } from "@tanstack/react-devtools"
import type { QueryClient } from "@tanstack/react-query"
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import interFont from "inter-ui/variable/InterVariable.woff2?url"
import { useMemo } from "react"

import {
  APP_LOCALE_IDS,
  APP_POSIX_LOCALE_ID_MAP,
  getAppDocumentMetadata,
  SUPPORTED_LOCALE_IDS,
} from "#/app.config"
import { BRAND_X_HANDLE, PRODUCTION_BASE_URL, PROJECT_CANONICAL_NAME } from "#/common/constants"
import { localeActivation } from "#/common/i18n"
import { isEmbeddedByLoader, useEmbedEscapeClose } from "#/common/integrations/embed"
import { TanStackQueryDevtools } from "#/common/integrations/tanstack-query"

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

    //* The Docker image prerenders a placeholder here, which its nginx replaces with the deployment's URL.
    const baseUrl = isServer ? PRODUCTION_BASE_URL : location.origin

    const { title, meta, links } = getDocumentHead({
      baseUrl,
      favicon: { href: "/checkout/favicon.ico", type: "image/x-icon" },
      localeId: globalI18n.locale,
      ogSiteName: PROJECT_CANONICAL_NAME,
      posixLocaleIdMap: APP_POSIX_LOCALE_ID_MAP,
      routePath,
      staticParams: getAppDocumentMetadata(),
      supportedLocaleIds: SUPPORTED_LOCALE_IDS,
      twitterHandles: { author: BRAND_X_HANDLE, site: BRAND_X_HANDLE },
    })

    return {
      meta: [{ title }, { name: "robots", content: "noindex, nofollow" }, ...meta],
      links: [{ rel: "stylesheet", href: unoCss }, getFontPreloadLink(interFont), ...links],
      scripts: [{ src: "/checkout/config.js" }],
    }
  },

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const { i18n } = useLingui()
  const currentRoute = useClientRoute()
  const isClient = useIsClient()

  const isSheetFrame = useRouterState({
    select: ({ location }) => location.search.sheetFrame === true,
  })

  const isEmbedRequested = useRouterState({
    select: ({ location }) => isEmbeddedByLoader(location.search),
  })

  const isEmbeddedCheckout = isClient && isEmbedRequested

  useEmbedEscapeClose(isEmbeddedCheckout)

  const layoutConfig = useMemo(() => getLayoutConfig(i18n), [i18n])

  useI18nInitialization({ localeActivation, supportedLocaleIds: APP_LOCALE_IDS })

  return (
    <html lang={i18n.locale} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>

      <body
        className={cn(
          `
            font-sans text-foreground
            selection:bg-primary/25
            wrap-anywhere antialiased
          `,
          isEmbeddedCheckout ? "bg-transparent" : "bg-background",
        )}
      >
        <ThemeProvider>
          <LayoutContextProvider
            LinkComponent={Link}
            currentRoute={currentRoute}
            isHydrated={isClient}
            layoutConfig={layoutConfig}
          >
            <LayoutContainer
              className={cn(
                `
                  p-4
                  print:p-0
                  flex min-h-screen items-center justify-center
                  print:items-start
                `,
                !isEmbeddedCheckout && "bg-muted/40",
              )}
            >
              {children}
            </LayoutContainer>
          </LayoutContextProvider>

          <Toaster />

          {!isSheetFrame && !isEmbeddedCheckout && (
            <TanStackDevtools
              config={{ position: "bottom-right" }}
              plugins={[
                { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
                TanStackQueryDevtools,
              ]}
            />
          )}
        </ThemeProvider>

        <Scripts />
      </body>
    </html>
  )
}
