import { createRouter as createTanStackRouter } from "@tanstack/react-router"

import { localeActivation } from "@/common/i18n"
import { NotFound } from "@/routes/-layout/components/not-found"

import { routeTree } from "./routeTree.gen"

export function getRouter() {
  localeActivation.activateSourceLocale()

  return createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
  })
}
