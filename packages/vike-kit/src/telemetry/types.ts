import type { PlausibleConfig } from "@plausible-analytics/tracker"

export type TrackingConfig = Pick<PlausibleConfig, "domain" | "endpoint"> & {
  enabled: boolean
}
