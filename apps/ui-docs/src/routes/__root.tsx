import { cn } from "@bitcart/ui-kit/utils"
import { RootProvider } from "@fumadocs/base-ui/provider/tanstack"
import { I18nProvider } from "@lingui/react"
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router"

import { DEFAULT_BRAND } from "@/common/constants"
import { i18n } from "@/common/i18n"
import { BrandProvider, SearchDialog, ThemeSync } from "@/common/ui/components"

import { THEME_INIT_SCRIPT } from "./-layout/constants"

import appCss from "./-layout/app.css?url"
import unoCss from "./-layout/uno.generated.css?url"

function RootComponent() {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <HeadContent />
      </head>

      {/*! The SSR'd default brand class is corrected pre-paint by THEME_INIT_SCRIPT below,
          hence the suppressed hydration warning. */}
      <body
        suppressHydrationWarning
        className={cn(`theme-${DEFAULT_BRAND}`, "flex min-h-screen flex-col")}
      >
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />

        <I18nProvider i18n={i18n}>
          {/*! Fumadocs already defaults the mode to light/dark/system on the `class`
              attribute; `color-scheme` is applied alongside the brand instead. */}
          <RootProvider search={{ SearchDialog }} theme={{ enableColorScheme: false }}>
            <BrandProvider>
              <ThemeSync />

              <Outlet />
            </BrandProvider>
          </RootProvider>
        </I18nProvider>

        <Scripts />
      </body>
    </html>
  )
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Bitcart UI SDK Documentation" },
    ],

    links: [
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: unoCss },
    ],
  }),

  component: RootComponent,
})
