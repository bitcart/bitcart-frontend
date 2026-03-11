import { env } from "@/env"

const VITE_MODE = import.meta.env.MODE

export const { BRAND_UMBRELLA_NAME, PRODUCTION_BASE_URL, PROJECT_CANONICAL_NAME } = env

export const ENV_TAG: "development" | "production" =
  VITE_MODE === "production" ? "production" : "development"

export const IS_MATOMO_ENABLED = ENV_TAG === "production" && env.BITCART_MATOMO_URL.length > 0
