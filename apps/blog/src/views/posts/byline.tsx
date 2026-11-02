import { Link } from "@bitcart/tanstack-start-kit/navigation"

import type { PostSummary } from "#/common/content/posts"
import { AUTHORS } from "#/common/content/taxonomy"
import { getAuthorHref } from "#/common/navigation"

import { AuthorAvatar } from "./author-avatar"
import { PostMeta } from "./post-meta"

export type BylineProps = {
  post: PostSummary
}

export const Byline: React.FC<BylineProps> = ({ post }) => {
  const author = AUTHORS[post.author]

  return (
    <div className="gap-x-2 gap-y-1 text-sm text-muted-foreground flex flex-wrap items-center">
      <AuthorAvatar author={author} />

      <Link
        href={getAuthorHref(post.author)}
        className="font-medium text-foreground relative z-10 hover:underline"
      >
        {author.name}
      </Link>

      <span aria-hidden>·</span>
      <PostMeta post={post} />
    </div>
  )
}
