import type { MatomoConfig } from "./types"

export const configureMatomo = (config: MatomoConfig) => {
  if (config.enabled) {
    const _paq = (window._paq = window._paq || [])

    _paq.push(["setTrackerUrl", config.url])
    _paq.push(["setSiteId", config.siteId])
    _paq.push(["enableLinkTracking"])
    _paq.push(["enableHeartBeatTimer", 15])
    config.actions.forEach((action) => _paq.push(action))

    // FIXME: Consider returning the script element and passing it to `createHead` instead
    const script = document.createElement("script")
    const head = document.head || document.getElementsByTagName("head")[0]

    script.async = true
    script.defer = true
    script.src = config.scriptUrl
    head.appendChild(script)
  }
}
