import { Link } from "@bitcart/tanstack-start-kit/navigation"

import type { PostSummary } from "#/common/content/posts"
import { getPostHref } from "#/common/navigation"

import { Byline } from "./byline"
import { CategoryBadge } from "./category-badge"
import { CoverImage } from "./cover-image"

export type FeaturedPostProps = {
  post: PostSummary
  label: string
}

export const FeaturedPost: React.FC<FeaturedPostProps> = ({ post, label }) => (
  <article className="group gap-6 md:gap-10 md:grid-cols-[3fr_2fr] relative grid items-center">
    <CoverImage
      post={post}
      layout="feature"
      loadPriority="high"
      className="rounded-xl shadow-sm border"
    />

    <div className="gap-4 flex flex-col items-start">
      <div className="gap-3 flex items-center">
        <span className="text-sm font-medium text-primary-text">{label}</span>
        <CategoryBadge category={post.category} />
      </div>

      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-balance">
        <Link
          href={getPostHref(post.slug)}
          className="after:inset-0 group-hover:text-primary-text after:absolute"
        >
          {post.title}
        </Link>
      </h2>

      <p className="text-muted-foreground">{post.description}</p>
      <Byline post={post} />
    </div>
  </article>
)
