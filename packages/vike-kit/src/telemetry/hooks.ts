import { useEffect } from "react"
import { usePageContext } from "vike-react/usePageContext"

import { trackEvent } from "./effects"

export const useNotFoundTracking = (): void => {
  const { is404, urlPathname } = usePageContext()

  useEffect(() => {
    if (is404) trackEvent("404", { props: { path: window.location.pathname } })
  }, [is404, urlPathname])
}
