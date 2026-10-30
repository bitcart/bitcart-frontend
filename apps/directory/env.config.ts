import { runtimeEnvTagSchema } from "@bitcart/core/env"
import * as z from "zod"

export const envConfig = {
  clientEnvSchemas: {
    BITCART_STORE: z.string().default("1"),
    BITCART_PLAUSIBLE_ENABLED: z.stringbool().default(false),
    BITCART_PLAUSIBLE_ENDPOINT: z.url().optional(),
  },

  sharedEnvSchemas: {
    BITCART_ENV: runtimeEnvTagSchema,
    BRAND_UMBRELLA_NAME: z.string().default("Bitcart"),
    PRODUCTION_BASE_URL: z.string().default("https://directory.bitcart.ai"),
    PROJECT_CANONICAL_NAME: z.string().default("Bitcart Directory"),
  },
}
