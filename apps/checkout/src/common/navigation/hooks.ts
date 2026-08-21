import type { ClientRoute, InternalHref } from "@bitcart/core/navigation"
import { useIsClient } from "@bitcart/hooks"
import { useLocation } from "@tanstack/react-router"
import { useMemo } from "react"

/**
 * Adapts TanStack Router's parsed location to the UI Kit's framework-agnostic {@link ClientRoute}.
 */
export const useClientRoute = (): ClientRoute => {
  const { pathname, hash: locationHash } = useLocation()
  const isClient = useIsClient()

  //* Prerendered HTML never carries a hash.
  const hash = isClient && locationHash ? locationHash : null

  return useMemo(
    () => ({
      hash,
      pathname: pathname as InternalHref,
      pathnameWithHash: (hash ? `${pathname}#${hash}` : pathname) as InternalHref,
    }),

    [hash, pathname],
  )
}
