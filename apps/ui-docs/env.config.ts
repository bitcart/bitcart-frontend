import { runtimeEnvTagSchema } from "@bitcart/core/env"

export const envConfig = {
  clientEnvSchemas: {},

  sharedEnvSchemas: {
    BITCART_ENV: runtimeEnvTagSchema,
  },
}
