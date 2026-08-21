import type { TwitterHandle } from "@bitcart/core/types"

import { env } from "#/env"

export const {
  BITCART_ENV: ENV_TAG,
  BITCART_API_URL,
  BRAND_UMBRELLA_NAME,
  PRODUCTION_BASE_URL,
  PROJECT_CANONICAL_NAME,
} = env

export const BRAND_X_HANDLE: TwitterHandle = "@BitcartCC"
