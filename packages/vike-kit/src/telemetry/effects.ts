import { init, track, type PlausibleEventOptions } from "@plausible-analytics/tracker"

import type { TrackingConfig } from "./types"

let isTrackingEnabled = false

export const configurePlausible = ({ enabled, ...config }: TrackingConfig): void => {
  if (enabled) {
    init({ ...config, outboundLinks: true, fileDownloads: true })
    isTrackingEnabled = true
  }
}

export const trackEvent = (name: string, options: PlausibleEventOptions = {}): void => {
  if (isTrackingEnabled) track(name, options)
}
