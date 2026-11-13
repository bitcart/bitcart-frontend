import type { InferEnv } from "@bitcart/core/env"

import type { envConfig } from "../env.config"

export const env: InferEnv<typeof envConfig> = {
  BITCART_ENV: import.meta.env.BITCART_ENV,
  BRAND_UMBRELLA_NAME: import.meta.env.BRAND_UMBRELLA_NAME,
  PRODUCTION_BASE_URL: import.meta.env.PRODUCTION_BASE_URL,
  PROJECT_CANONICAL_NAME: import.meta.env.PROJECT_CANONICAL_NAME,
}
