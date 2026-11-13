import type { InferEnv } from "@bitcart/core/env"

import type { envConfig } from "../env.config"

export const env: InferEnv<typeof envConfig> = {
  BITCART_ENV: import.meta.env.BITCART_ENV,
}
