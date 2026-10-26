import { createEnv } from "@t3-oss/env-core"

import { envConfig } from "../env.config"

declare global {
  interface Window {
    BITCART_CONFIG?: { BITCART_API_URL?: string }
  }
}

const runtimeConfig = typeof window === "undefined" ? undefined : window.BITCART_CONFIG

export const env = createEnv({
  clientPrefix: "BITCART_",
  emptyStringAsUndefined: true,
  client: envConfig.clientEnvSchemas,
  shared: envConfig.sharedEnvSchemas,

  runtimeEnv: {
    BITCART_ENV: import.meta.env.BITCART_ENV,
    BITCART_API_URL: runtimeConfig?.BITCART_API_URL || import.meta.env.BITCART_API_URL,
    PRODUCTION_BASE_URL: import.meta.env.PRODUCTION_BASE_URL,
    PROJECT_CANONICAL_NAME: import.meta.env.PROJECT_CANONICAL_NAME,
  },
})
