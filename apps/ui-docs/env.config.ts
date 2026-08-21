import { runtimeEnvTagSchema } from "@bitcart/core/validation"

export const envConfig = {
  clientEnvSchemas: {},

  sharedEnvSchemas: {
    BITCART_ENV: runtimeEnvTagSchema,
  },
}
