import { runtimeEnvTagSchema } from "@bitcart/core/env"
import { z } from "zod"

export const envConfig = {
  clientEnvSchemas: {
    BITCART_PLAUSIBLE_ENABLED: z.stringbool().default(false),
    BITCART_PLAUSIBLE_ENDPOINT: z.url().optional(),
  },

  sharedEnvSchemas: {
    BITCART_ENV: runtimeEnvTagSchema,
    PRODUCTION_BASE_URL: z.string().default("https://blog.bitcart.ai"),
  },
}
