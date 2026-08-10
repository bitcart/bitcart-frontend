import { createRouter as createTanStackRouter } from "@tanstack/react-router"

import { NotFound } from "@/routes/-layout/components/not-found"

import { routeTree } from "./routeTree.gen"

export function getRouter() {
  return createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultNotFoundComponent: NotFound,
  })
}
