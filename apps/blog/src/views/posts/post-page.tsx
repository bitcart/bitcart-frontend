import { cn } from "@bitcart/ui-kit/utils"
import { useLingui } from "@lingui/react/macro"

import { BRAND_RENAME_DATE } from "#/common/constants"
import type { PostSummary } from "#/common/content/posts"

import { Byline } from "./byline"
import { CategoryBadge } from "./category-badge"
import { CoverImage } from "./cover-image"
import { NeighbourCard } from "./neighbour-card"
import { RenameNote } from "./rename-note"

export type PostPageProps = {
  post: PostSummary
  newer?: PostSummary
  older?: PostSummary
  children: React.ReactNode
}

export const PostPage: React.FC<PostPageProps> = ({ post, newer, older, children }) => {
  const { t } = useLingui()
  const isBeforeRename = post.date < BRAND_RENAME_DATE

  return (
    <article className="max-w-7xl px-4 md:px-6 lg:px-8 pt-6 md:pt-10 pb-12 md:pb-16 mx-auto">
      <header className="gap-6 md:gap-10 md:grid-cols-[2fr_3fr] grid items-center">
        <div className="gap-4 flex flex-col items-start">
          <CategoryBadge category={post.category} />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">
            {post.title}
          </h1>
          <p className="text-lg text-muted-foreground">{post.description}</p>
          <Byline post={post} />
        </div>

        <CoverImage
          post={post}
          layout="feature"
          loadPriority="high"
          className="max-md:-order-1 rounded-xl shadow-sm border"
        />
      </header>

      {isBeforeRename && <RenameNote className="mt-10 md:mt-14 max-w-3xl mx-auto" />}

      <div
        className={cn(
          "max-w-3xl prose prose-lg mx-auto",
          isBeforeRename ? "mt-8" : "mt-10 md:mt-14",
        )}
      >
        {children}
      </div>

      {(newer ?? older) && (
        <nav
          aria-label={t`More posts`}
          className="mt-14 max-w-3xl gap-4 sm:grid-cols-2 mx-auto grid"
        >
          {older && <NeighbourCard post={older} direction="older" />}
          {newer && <NeighbourCard post={newer} direction="newer" />}
        </nav>
      )}
    </article>
  )
}
