import { getFontPreloadLink } from "@bitcart/tanstack-start-kit/metadata"
import { RootProvider } from "@fumadocs/base-ui/provider/tanstack"
import { I18nProvider } from "@lingui/react"
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router"
import interFont from "inter-ui/variable/InterVariable.woff2?url"

import { i18n } from "@/common/i18n"
import { SearchDialog } from "@/common/ui/components"

import appCss from "./-layout/app.css?url"
import unoCss from "./-layout/uno.generated.css?url"

function RootComponent() {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <HeadContent />
      </head>

      <body className="flex min-h-screen flex-col">
        <I18nProvider i18n={i18n}>
          <RootProvider search={{ SearchDialog }}>
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
      getFontPreloadLink(interFont),
    ],
  }),

  component: RootComponent,
})
