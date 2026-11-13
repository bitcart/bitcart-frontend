import type { InferEnv } from "@bitcart/core/env"

import type { envConfig } from "../env.config"

export const env: InferEnv<typeof envConfig> = {
  BITCART_ENV: import.meta.env.BITCART_ENV,
  BITCART_PLAUSIBLE_ENABLED: import.meta.env.BITCART_PLAUSIBLE_ENABLED,
  BITCART_PLAUSIBLE_ENDPOINT: import.meta.env.BITCART_PLAUSIBLE_ENDPOINT,
  PRODUCTION_BASE_URL: import.meta.env.PRODUCTION_BASE_URL,
}
