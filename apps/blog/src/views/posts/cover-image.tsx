import { BitcartWordmarkIcon } from "@bitcart/ui-kit/icons"
import { cn } from "@bitcart/ui-kit/utils"

import { getResponsiveImage } from "#/common/content/media"
import type { PostSummary } from "#/common/content/posts"

import { COVER_SIZES, isLogoCover } from "./cover"

export type CoverImageProps = {
  post: PostSummary
  layout: keyof typeof COVER_SIZES
  loadPriority?: "high" | "eager" | "lazy"
  className?: string
}

export const CoverImage: React.FC<CoverImageProps> = ({
  post,
  layout,
  loadPriority = "lazy",
  className,
}) => {
  //* Drawn as the wordmark, so its letters follow the theme.
  if (isLogoCover(post)) {
    return (
      <div className={cn("bg-muted aspect-video flex w-full items-center px-[12%]", className)}>
        <BitcartWordmarkIcon aria-hidden className="h-auto w-full" />
      </div>
    )
  } else
    return (
      <img
        {...getResponsiveImage(post.image.src)}
        sizes={COVER_SIZES[layout]}
        alt={post.image.alt}
        loading={loadPriority === "lazy" ? "lazy" : "eager"}
        fetchPriority={loadPriority === "high" ? "high" : "auto"}
        className={cn("bg-muted aspect-video w-full object-cover object-top", className)}
      />
    )
}
