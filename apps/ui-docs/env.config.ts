import { runtimeEnvTagSchema } from "@bitcart/core/zod"

export const envConfig = {
  clientEnvSchemas: {},

  sharedEnvSchemas: {
    BITCART_ENV: runtimeEnvTagSchema,
  },
}
