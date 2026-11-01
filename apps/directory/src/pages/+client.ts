import { configurePlausible } from "@bitcart/core/telemetry"
import { applyZodL10n } from "@bitcart/form-kit/validation"

import { IS_PLAUSIBLE_ENABLED, PRODUCTION_BASE_URL } from "@/common/constants"
import { env } from "@/env"

configurePlausible({
  enabled: IS_PLAUSIBLE_ENABLED,
  domain: new URL(PRODUCTION_BASE_URL).hostname,
  endpoint: env.BITCART_PLAUSIBLE_ENDPOINT,
})

//* Forms validate only in the browser, so the server never needs Zod's localized messages.
applyZodL10n()
