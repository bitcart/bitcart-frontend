import { useEffect } from "react"
import { useIsClient } from "usehooks-ts"
import { usePageContext } from "vike-react/usePageContext"

import type { MatomoConfig } from "./types"

declare global {
  interface Window {
    _paq: unknown[][]
  }
}

export const createUseMatomoTracking = (config: MatomoConfig) => {
  return (): void => {
    const pageContext = usePageContext()
    const isClient = useIsClient()
    const { previousPageContext } = pageContext

    useEffect(() => {
      if (!config.enabled) return

      const url = window.location.origin + pageContext.urlOriginal

      const referrerUrl = previousPageContext?.urlOriginal
        ? window.location.origin + previousPageContext.urlOriginal
        : undefined

      const title = pageContext.metadata.title

      if (isClient) {
        const _paq = (window._paq = window._paq || [])

        if (referrerUrl) {
          _paq.push(["setReferrerUrl", referrerUrl])
        }

        _paq.push(["setCustomUrl", url])
        _paq.push(["trackPageView", title])
      }
    }, [isClient, pageContext, previousPageContext])
  }
}
