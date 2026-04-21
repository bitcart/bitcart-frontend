import type { InternalHref, RouteBindings } from "@bitcart/core/types"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useEventListener } from "usehooks-ts"
import { useHydrated } from "vike-react/useHydrated"
import { usePageContext } from "vike-react/usePageContext"

const getLocationHash = (): string | null => window.location.hash.substring(1) || null

export const useRoute = (): RouteBindings => {
  const isHydrated = useHydrated()

  const {
    urlOriginal,
    urlParsed: { pathname },
  } = usePageContext()

  const [hash, setHash] = useState<string | null>(null)

  const pathnameWithHash: InternalHref = useMemo(
    () => (pathname + (hash ? `#${hash}` : "")) as InternalHref,
    [hash, pathname],
  )

  const syncHash = useCallback(() => {
    setHash(getLocationHash())
  }, [])

  useEffect(() => {
    if (isHydrated) {
      // oxlint-disable-next-line react-hooks-js/set-state-in-effect
      syncHash()
    }
  }, [
    isHydrated,
    syncHash,

    //* `urlOriginal` is what actually changes on hash-including Vike navigation;
    //* `urlParsed.pathname` has the locale stripped, so e.g. `/fr` → `/fr/#features`
    //* looks identical at the pathname level and would miss the transition.
    //! Make sure to preserve this dependency as it prevents rerender loops
    urlOriginal,
  ])

  //* Catch same-page anchor clicks and hash-only back/forward navigation.
  useEventListener("hashchange", syncHash)

  return {
    hash,
    pathname,
    pathnameWithHash,
  }
}
