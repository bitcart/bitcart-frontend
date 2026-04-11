import { env } from "@/env"

export const {
  BITCART_ENV: ENV_TAG,
  BRAND_UMBRELLA_NAME,
  PRODUCTION_BASE_URL,
  PROJECT_CANONICAL_NAME,
} = env

export const IS_MATOMO_ENABLED = ENV_TAG === "production" && env.BITCART_MATOMO_URL.length > 0
