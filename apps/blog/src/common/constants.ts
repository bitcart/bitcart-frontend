import type { AccountHandle } from "@bitcart/core/types"
import { msg } from "@lingui/core/macro"

import { env } from "#/env"

export const { BITCART_ENV: ENV_TAG, PRODUCTION_BASE_URL } = env

export const IS_PLAUSIBLE_ENABLED = ENV_TAG === "production" && env.BITCART_PLAUSIBLE_ENABLED

export const BRAND_NAME = "Bitcart"
export const BRAND_RENAME_DATE = "2023-08-14"
export const BLOG_NAME = "Bitcart Blog"
export const BLOG_TAGLINE = msg`Release notes, announcements and plugins from the Bitcart team.`
export const BRAND_X_HANDLE: AccountHandle = "@BitcartCC"

export const RSS_FEED_PATH = "/rss.xml"
export const SEARCH_INDEX_PATH = "/search.json"

export const DEFAULT_SHARE_IMAGE = {
  src: "/media/share-image.jpeg",
  alt: "Bitcart logo",
} as const
