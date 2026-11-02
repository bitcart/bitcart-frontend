import { Button, ScrollArea } from "@bitcart/ui-kit/components"
import { Plural, useLingui } from "@lingui/react/macro"
import { RssIcon } from "lucide-react"
import { useMemo } from "react"

import { BLOG_NAME, BLOG_TAGLINE, RSS_FEED_PATH } from "#/common/constants"
import {
  filterPostsByAuthor,
  filterPostsByCategory,
  getCategoriesWithPosts,
  type PostSummary,
} from "#/common/content/posts"
import { AUTHORS, CATEGORIES } from "#/common/content/taxonomy"

import { AuthorAvatar } from "./author-avatar"
import { FeaturedPost } from "./featured-post"
import { FilterNav } from "./filter-nav"
import type { ListFilter } from "./list-filter"
import { PostCard } from "./post-card"

const FIRST_ROW_CARD_COUNT = 3

export type ListPageProps = {
  posts: PostSummary[]
  filter: ListFilter
}

export const ListPage: React.FC<ListPageProps> = ({ posts, filter }) => {
  const { t } = useLingui()
  const categories = useMemo(() => getCategoriesWithPosts(posts), [posts])
  const author = filter.kind === "author" ? AUTHORS[filter.key] : undefined

  const { title, description, filteredPosts } = useMemo(() => {
    if (filter.kind === "category") {
      return {
        title: CATEGORIES[filter.key].label,
        description: CATEGORIES[filter.key].description,
        filteredPosts: filterPostsByCategory(posts, filter.key),
      }
    } else if (filter.kind === "author") {
      return {
        title: AUTHORS[filter.key].name,
        description: AUTHORS[filter.key].bio,
        filteredPosts: filterPostsByAuthor(posts, filter.key),
      }
    } else
      return {
        title: BLOG_NAME,
        description: t(BLOG_TAGLINE),
        filteredPosts: posts,
      }
  }, [filter, posts, t])

  const [featuredPost, ...otherPosts] = filteredPosts

  return (
    <div className="max-w-7xl px-4 md:px-6 lg:px-8 pt-4 md:pt-8 pb-10 md:pb-14 mx-auto">
      <div className="gap-4 lg:flex-row lg:items-center flex flex-col justify-between">
        <div className="min-w-0">
          <div className="gap-2 lg:justify-start flex items-center justify-between">
            <h1 className="text-sm font-medium text-muted-foreground gap-2 min-w-0 flex items-center">
              {author && <AuthorAvatar author={author} className="size-5" />}

              <span className="text-foreground truncate">{title}</span>

              <span className="shrink-0">
                · <Plural value={filteredPosts.length} one="# post" other="# posts" />
              </span>
            </h1>

            <Button
              variant="ghost"
              size="icon-sm"
              role="link"
              nativeButton={false}
              render={<a href={RSS_FEED_PATH} aria-label={t`RSS feed`} title={t`RSS feed`} />}
              className="-my-1.5 shrink-0"
            >
              <RssIcon aria-hidden />
            </Button>
          </div>

          <p className="mt-0.5 text-sm text-muted-foreground lg:truncate">{description}</p>
        </div>

        {/* Below `lg`, the row runs to the screen edges, so a cut-off pill shows that it scrolls. */}
        <ScrollArea
          scrollFade
          className="max-lg:-mx-4 max-lg:w-[calc(100%+2rem)] md:max-lg:-mx-6 md:max-lg:w-[calc(100%+3rem)] lg:w-auto lg:shrink-0"
        >
          <div className="max-lg:px-4 md:max-lg:px-6 w-max">
            <FilterNav posts={posts} categories={categories} filter={filter} />
          </div>
        </ScrollArea>
      </div>

      <div className="mt-8 gap-12 flex min-h-[60vh] flex-col">
        {featuredPost && <FeaturedPost post={featuredPost} label={t`Latest`} />}

        <div className="gap-6 sm:grid-cols-2 lg:grid-cols-3 grid content-start">
          {otherPosts.map((post, index) => (
            <PostCard key={post.slug} post={post} isAboveFold={index < FIRST_ROW_CARD_COUNT} />
          ))}
        </div>
      </div>
    </div>
  )
}
