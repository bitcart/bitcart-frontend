export interface MatomoConfig {
  enabled: boolean
  url: string
  scriptUrl: string
  siteId: number
  actions: unknown[][]
}

export interface TrackingConfig {
  matomo: MatomoConfig
}
