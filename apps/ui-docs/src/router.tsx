import { createRouter } from "@tanstack/react-router"

import { localeActivation } from "@/common/i18n"
import { NotFound } from "@/routes/-layout/components/not-found"

import { routeTree } from "./routeTree.gen"

export function getRouter() {
  localeActivation.activateSourceLocale()

  return createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
  })
}
