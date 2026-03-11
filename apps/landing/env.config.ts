import { z } from "zod"

export const envConfig = {
  clientEnvSchemas: {
    BITCART_STORE: z.string().default("1"),
    BITCART_MATOMO_URL: z.string().default(""),
    BITCART_MATOMO_SCRIPT_URL: z.string().default(""),

    BITCART_MATOMO_ACTIONS: z
      .string()
      .default("")
      .transform((actions) =>
        actions
          .split(";")
          .filter((x) => x.trim() !== "")
          .map((x) => [x]),
      ),

    BITCART_MATOMO_ID: z.coerce.number().int().default(1),
  },

  sharedEnvSchemas: {
    BRAND_UMBRELLA_NAME: z.string().default("Bitcart"),
    PRODUCTION_BASE_URL: z.string().default("https://bitcart.ai"),
    PROJECT_CANONICAL_NAME: z.string().default("Bitcart"),
  },
}
