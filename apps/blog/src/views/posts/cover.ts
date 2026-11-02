import { preloadImage } from "@bitcart/core/utils"

import { DEFAULT_SHARE_IMAGE } from "#/common/constants"
import { getResponsiveImage } from "#/common/content/media"
import type { PostSummary } from "#/common/content/posts"

//* Displayed widths: the 3fr column of a featured post or post header, and a grid card.
export const COVER_SIZES = {
  feature: "(min-width: 80rem) 44rem, (min-width: 48rem) 58vw, 100vw",
  card: "(min-width: 80rem) 25rem, (min-width: 64rem) 31vw, (min-width: 40rem) 50vw, 100vw",
}

const PRELOAD_TIMEOUT_MS = 300

export const isLogoCover = (post: PostSummary) => post.image.src === DEFAULT_SHARE_IMAGE.src

export const preloadFeatureCover = (post: PostSummary | undefined): Promise<void> =>
  post && !isLogoCover(post)
    ? preloadImage(
        { ...getResponsiveImage(post.image.src), sizes: COVER_SIZES.feature },
        { timeoutMs: PRELOAD_TIMEOUT_MS },
      )
    : Promise.resolve()
