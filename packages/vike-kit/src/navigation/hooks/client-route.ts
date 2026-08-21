import type { ClientRoute } from "@bitcart/core/navigation"
import { useMemo, useSyncExternalStore } from "react"
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
  const {
    urlParsed: { pathname },
  } = usePageContext()

  //* Subscribe to hash-only URL changes that don't go through Vike's router:
  //* native back/forward (popstate), browser hash anchors, and the synthetic
  //* `hashchange` that `Link` dispatches after a same-page `pushState`.
  //* Cross-page Vike transitions re-render via `usePageContext()` instead.
  //* `getServerHash` returns `""` on SSR and the initial client render,
  //* so `hash` is `null` until hydration completes — no mismatch.
  const hashSnapshot = useSyncExternalStore(subscribe, getClientHash, getServerHash)

  const hash: string | null = hashSnapshot.substring(1) || null

  return useMemo(
    () => ({
      pathname,
      hash,
      pathnameWithHash: hash ? `${pathname}#${hash}` : pathname,
    }),

    [pathname, hash],
  )
}
