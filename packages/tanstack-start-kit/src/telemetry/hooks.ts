import { trackEvent } from "@bitcart/core/telemetry"
import { useLocation } from "@tanstack/react-router"
import { useEffect } from "react"

//! Call it only from the root route's `notFoundComponent`: it reports every render as a 404.
export const useNotFoundTracking = (): void => {
  const { pathname } = useLocation()

  useEffect(() => {
    trackEvent("404", { props: { path: pathname } })
  }, [pathname])
}
