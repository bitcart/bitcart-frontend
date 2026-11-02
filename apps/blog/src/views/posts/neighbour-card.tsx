import { Link } from "@bitcart/tanstack-start-kit/navigation"
import { Card } from "@bitcart/ui-kit/components"
import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"
import { ArrowLeft, ArrowRight } from "lucide-react"

import type { PostSummary } from "#/common/content/posts"
import { getPostHref } from "#/common/navigation"

export type NeighbourCardProps = {
  post: PostSummary
  direction: "older" | "newer"
}

export const NeighbourCard: React.FC<NeighbourCardProps> = ({ post, direction }) => {
  const { t } = useLingui()

  return (
    <Card
      className={cn(
        "group p-5 gap-2 relative",
        direction === "newer" && "sm:col-start-2 sm:items-end sm:text-right",
      )}
    >
      <span className="text-sm text-muted-foreground gap-1 flex items-center">
        {direction === "older" ? (
          <>
            <ArrowLeft aria-hidden className="size-4" /> {t`Older post`}
          </>
        ) : (
          <>
            {t`Newer post`} <ArrowRight aria-hidden className="size-4" />
          </>
        )}
      </span>

      <Link
        href={getPostHref(post.slug)}
        className="font-semibold after:inset-0 group-hover:text-primary-text after:absolute"
      >
        {post.title}
      </Link>
    </Card>
  )
}
