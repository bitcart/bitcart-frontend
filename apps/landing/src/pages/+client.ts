import { configureMatomo } from "@bitcart/vike-kit/tracking"

import { IS_MATOMO_ENABLED } from "@/common/constants"
import { env } from "@/env"

configureMatomo({
  enabled: IS_MATOMO_ENABLED,
  url: env.BITCART_MATOMO_URL,
  scriptUrl: env.BITCART_MATOMO_SCRIPT_URL,
  siteId: env.BITCART_MATOMO_ID,
  actions: env.BITCART_MATOMO_ACTIONS,
})
