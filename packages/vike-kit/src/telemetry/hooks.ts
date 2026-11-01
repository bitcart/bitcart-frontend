import { trackEvent } from "@bitcart/core/telemetry"
import { useEffect } from "react"
import { usePageContext } from "vike-react/usePageContext"

export const useNotFoundTracking = (): void => {
  const { is404, urlPathname } = usePageContext()

  useEffect(() => {
    if (is404) trackEvent("404", { props: { path: window.location.pathname } })
  }, [is404, urlPathname])
}
