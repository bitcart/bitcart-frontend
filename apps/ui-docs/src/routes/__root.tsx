import { cn } from "@bitcart/ui-kit/utils"
import { RootProvider } from "@fumadocs/base-ui/provider/tanstack"
import { I18nProvider } from "@lingui/react"
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router"

import { DEFAULT_THEME_KEY, THEME_KEYS, THEME_MODE_CLASS_BY_KEY } from "@/common/constants"
import { i18n } from "@/common/i18n"
import { SearchDialog, ThemeBrandSync } from "@/common/ui/components"
import { parseThemeKey } from "@/common/utils"

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
        className={cn(
          `theme-${parseThemeKey(DEFAULT_THEME_KEY).brand}`,
          "flex min-h-screen flex-col",
        )}
      >
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />

        <I18nProvider i18n={i18n}>
          <RootProvider
            search={{ SearchDialog }}
            theme={{
              themes: [...THEME_KEYS],
              defaultTheme: DEFAULT_THEME_KEY,
              enableSystem: false,
              disableTransitionOnChange: true,
              value: THEME_MODE_CLASS_BY_KEY,
            }}
          >
            <ThemeBrandSync />

            <Outlet />
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
