import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import { QueryClient } from "@tanstack/react-query"
import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"

import { activateSourceLocale } from "#/common/i18n"

import { routeTree } from "./routeTree.gen"

export function getRouter() {
  activateSourceLocale()

  const queryClient = new QueryClient()

  const router = createTanStackRouter({
    context: { queryClient },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    routeTree,
    scrollRestoration: true,
    Wrap: ({ children }) => <I18nProvider i18n={i18n}>{children}</I18nProvider>,
  })

  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
