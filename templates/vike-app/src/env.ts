import { createEnv } from "@t3-oss/env-core"

import { envConfig } from "../env.config"

export const env = createEnv({
  clientPrefix: "BITCART_",
  emptyStringAsUndefined: true,
  client: envConfig.clientEnvSchemas,
  shared: envConfig.sharedEnvSchemas,

  runtimeEnv: {
    BITCART_ENV: import.meta.env.BITCART_ENV,
    BRAND_UMBRELLA_NAME: import.meta.env.BRAND_UMBRELLA_NAME,
    PRODUCTION_BASE_URL: import.meta.env.PRODUCTION_BASE_URL,
    PROJECT_CANONICAL_NAME: import.meta.env.PROJECT_CANONICAL_NAME,
  },
})
