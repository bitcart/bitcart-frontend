import type { AccountHandle } from "@bitcart/core/types"

import { env } from "@/env"

export const {
  BITCART_ENV: ENV_TAG,
  BRAND_UMBRELLA_NAME,
  PRODUCTION_BASE_URL,
  PROJECT_CANONICAL_NAME,
} = env

export const BRAND_X_HANDLE: AccountHandle = "@BitcartCC"

export const IS_PLAUSIBLE_ENABLED = ENV_TAG === "production" && env.BITCART_PLAUSIBLE_ENABLED
