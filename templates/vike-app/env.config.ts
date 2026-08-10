import { runtimeEnvTagSchema } from "@bitcart/core/zod"
import { z } from "zod"

export const envConfig = {
  //! Client-side variables must be prefixed with `BITCART_` to be exposed by Vite.
  clientEnvSchemas: {},

  sharedEnvSchemas: {
    BITCART_ENV: runtimeEnvTagSchema,
    BRAND_UMBRELLA_NAME: z.string().default("Bitcart"),
    PRODUCTION_BASE_URL: z.string().default("http://localhost:3002"),
    PROJECT_CANONICAL_NAME: z.string().default("Bitcart Vike Example"),
  },
}
