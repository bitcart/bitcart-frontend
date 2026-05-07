import type { ClientRoute } from "@bitcart/core/types"
import { useMemo, useSyncExternalStore } from "react"
import { useHydrated } from "vike-react/useHydrated"
import { usePageContext } from "vike-react/usePageContext"

const subscribe = (callback: () => void): (() => void) => {
  window.addEventListener("hashchange", callback)
  window.addEventListener("popstate", callback)

  return () => {
    window.removeEventListener("hashchange", callback)
    window.removeEventListener("popstate", callback)
  }
}

const getClientHash = (): string => window.location.hash

const getServerHash = (): string => ""

export const useClientRoute = (): ClientRoute => {
  const isHydrated = useHydrated()

  const {
    urlParsed: { pathname },
  } = usePageContext()

  //* Subscribe to hash-only URL changes that don't go through Vike's router:
  //* native back/forward (popstate), browser hash anchors, and the synthetic
  //* `hashchange` that `Link` dispatches after a same-page `pushState`.
  //* Cross-page Vike transitions re-render via `usePageContext()` instead.
  useSyncExternalStore(subscribe, getClientHash, getServerHash)

  //* Hash must come from `window.location` because same-page hash
  //* navigation doesn't refresh Vike's `urlParsed`.
  const hash: string | null = isHydrated ? window.location.hash.substring(1) || null : null

  return useMemo(
    () => ({
      pathname,
      hash,
      pathnameWithHash: hash ? `${pathname}#${hash}` : pathname,
    }),

    [pathname, hash],
  )
}
