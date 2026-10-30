import { configurePlausible } from "@bitcart/vike-kit/telemetry"

import { IS_PLAUSIBLE_ENABLED, PRODUCTION_BASE_URL } from "@/common/constants"
import { env } from "@/env"

configurePlausible({
  enabled: IS_PLAUSIBLE_ENABLED,
  domain: new URL(PRODUCTION_BASE_URL).hostname,
  endpoint: env.BITCART_PLAUSIBLE_ENDPOINT,
})
