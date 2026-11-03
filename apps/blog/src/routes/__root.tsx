import {
  BITCART_ORGANIZATION_JSON_LD,
  DEFAULT_VIEWPORT_PARAMS,
  getJsonLdScript,
  serializeViewportParams,
} from "@bitcart/core/metadata"
import { useIsClient } from "@bitcart/hooks"
import { getFontPreloadLink } from "@bitcart/tanstack-start-kit/metadata"
import { Link, useClientRoute } from "@bitcart/tanstack-start-kit/navigation"
import { LayoutContainer, WebsiteFooter } from "@bitcart/ui-kit/components"
import { LayoutContextProvider, ThemeProvider } from "@bitcart/ui-kit/providers"
import interLatinFont from "@fontsource-variable/inter/files/inter-latin-opsz-normal.woff2?url"
import { t } from "@lingui/core/macro"
import { I18nProvider, useLingui } from "@lingui/react"
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router"
import { useMemo } from "react"

import { BLOG_NAME, BLOG_TAGLINE, RSS_FEED_PATH } from "#/common/constants"
import { getCategoriesWithPosts, getPostSummaries, type PostSummary } from "#/common/content/posts"
import { i18n } from "#/common/i18n"

import { ErrorPage, NotFoundPage } from "./-layout/components/error-pages"
import { SiteHeader } from "./-layout/components/site-header"
import { getLayoutConfig } from "./-layout/config"

import unoCss from "./-layout/uno.generated.css?url"

export const Route = createRootRoute({
  loader: () => getPostSummaries(),

  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: serializeViewportParams(DEFAULT_VIEWPORT_PARAMS) },
      { title: BLOG_NAME },

      //* Routes replace it with their own; the error and not-found pages keep it.
      { name: "description", content: t(BLOG_TAGLINE) },
    ],

    links: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "stylesheet", href: unoCss },
      getFontPreloadLink(interLatinFont),

      { rel: "alternate", type: "application/rss+xml", title: BLOG_NAME, href: RSS_FEED_PATH },
    ],

    scripts: [getJsonLdScript(BITCART_ORGANIZATION_JSON_LD)],
  }),

  shellComponent: RootDocument,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  //* Anchor jumps stop below the fixed 4rem site header, with 1rem to spare.
  return (
    <html lang="en" className="scroll-pt-20" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>

      <body className="font-sans text-foreground bg-background selection:bg-primary/25 antialiased">
        <I18nProvider i18n={i18n}>
          <ThemeProvider>
            <BlogLayout>{children}</BlogLayout>
          </ThemeProvider>
        </I18nProvider>

        <Scripts />
      </body>
    </html>
  )
}

const NO_POSTS: PostSummary[] = []

function BlogLayout({ children }: { children: React.ReactNode }) {
  const { i18n: reactiveI18n } = useLingui()

  //* Missing when the root loader failed and the error page renders in its place.
  const posts: PostSummary[] = Route.useLoaderData() ?? NO_POSTS
  const currentRoute = useClientRoute()
  const isClient = useIsClient()
  const categories = useMemo(() => getCategoriesWithPosts(posts), [posts])

  const layoutConfig = useMemo(
    () => getLayoutConfig(reactiveI18n, categories),
    [reactiveI18n, categories],
  )

  return (
    <LayoutContextProvider
      LinkComponent={Link}
      currentRoute={currentRoute}
      isHydrated={isClient}
      layoutConfig={layoutConfig}
    >
      <LayoutContainer className="flex min-h-screen flex-col">
        <SiteHeader posts={posts} />

        <main id="main-content" className="pt-16 flex-1">
          {children}
        </main>

        <WebsiteFooter />
      </LayoutContainer>
    </LayoutContextProvider>
  )
}
