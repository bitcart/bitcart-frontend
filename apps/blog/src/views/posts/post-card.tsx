import { Link } from "@bitcart/tanstack-start-kit/navigation"
import { Card } from "@bitcart/ui-kit/components"

import type { PostSummary } from "#/common/content/posts"
import { getPostHref } from "#/common/navigation"

import { CategoryBadge } from "./category-badge"
import { CoverImage } from "./cover-image"
import { PostMeta } from "./post-meta"

export type PostCardProps = {
  post: PostSummary
  isAboveFold?: boolean
}

export const PostCard: React.FC<PostCardProps> = ({ post, isAboveFold = false }) => (
  <Card className="group py-0 gap-0 relative overflow-hidden">
    <CoverImage post={post} layout="card" loadPriority={isAboveFold ? "eager" : "lazy"} />

    <div className="p-5 gap-3 flex flex-1 flex-col items-start">
      <CategoryBadge category={post.category} />

      <h2 className="text-lg font-semibold leading-snug">
        <Link
          href={getPostHref(post.slug)}
          className="after:inset-0 group-hover:text-primary-text after:absolute"
        >
          {post.title}
        </Link>
      </h2>

      <p className="text-sm text-muted-foreground line-clamp-3">{post.description}</p>

      <p className="text-xs text-muted-foreground gap-1.5 mt-auto flex">
        <PostMeta post={post} />
      </p>
    </div>
  </Card>
)
