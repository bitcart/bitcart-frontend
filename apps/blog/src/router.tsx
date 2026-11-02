import { createRouter } from "@tanstack/react-router"

import { localeActivation } from "#/common/i18n"

import { routeTree } from "./routeTree.gen"

export function getRouter() {
  localeActivation.activateSourceLocale()

  return createRouter({
    routeTree,
    defaultPreload: "intent",

    //* Every loader reads data fixed at build time.
    defaultStaleTime: Infinity,
    scrollRestoration: true,
  })
}
