import { runtimeEnvTagSchema } from "@bitcart/core/validation"
import { z } from "zod"

export const envConfig = {
  clientEnvSchemas: {
    BITCART_API_URL: z.string().default("https://api.bitcart.ai"),
  },

  sharedEnvSchemas: {
    BITCART_ENV: runtimeEnvTagSchema,
    BRAND_UMBRELLA_NAME: z.string().default("Bitcart"),
    PRODUCTION_BASE_URL: z.string().default("https://checkout.bitcart.ai"),
    PROJECT_CANONICAL_NAME: z.string().default("Bitcart Checkout"),
  },
}
