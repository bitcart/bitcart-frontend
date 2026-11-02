import { createEnv } from "@t3-oss/env-core"

import { envConfig } from "../env.config"

export const env = createEnv({
  clientPrefix: "BITCART_",
  emptyStringAsUndefined: true,
  client: envConfig.clientEnvSchemas,
  shared: envConfig.sharedEnvSchemas,

  runtimeEnv: {
    BITCART_ENV: import.meta.env.BITCART_ENV,
  },
})
