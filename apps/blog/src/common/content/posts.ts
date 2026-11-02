import { createServerFn } from "@tanstack/react-start"
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions"

import type { PostFrontmatter } from "./schema"
import { postSource } from "./source"
import { CATEGORY_KEYS, type AuthorKey, type CategoryKey } from "./taxonomy"

const WORDS_PER_MINUTE = 220

export type PostSummary = PostFrontmatter & {
  slug: string
  path: string
  readingMinutes: number
}

const countWords = (text: string) => text.split(/\s+/).filter(Boolean).length

export const getPostSummaries = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async (): Promise<PostSummary[]> => {
    const summaries = await Promise.all(
      postSource.getPages().map(async (page) => {
        const { title, description, date, updated, author, category, image } = page.data
        const text = await page.data.getText("processed")

        return {
          title,
          description,
          date,
          updated,
          author,
          category,
          image,
          slug: page.slugs.join("/"),
          path: page.path,
          readingMinutes: Math.max(1, Math.round(countWords(text) / WORDS_PER_MINUTE)),
        }
      }),
    )

    return summaries.toSorted((a, b) => b.date.localeCompare(a.date))
  })

export const filterPostsByCategory = (posts: PostSummary[], category: CategoryKey) =>
  posts.filter((post) => post.category === category)

export const filterPostsByAuthor = (posts: PostSummary[], author: AuthorKey) =>
  posts.filter((post) => post.author === author)

export const getCategoriesWithPosts = (posts: PostSummary[]): CategoryKey[] =>
  CATEGORY_KEYS.filter((category) => posts.some((post) => post.category === category))

export const getNeighbourPosts = (
  posts: PostSummary[],
  slug: string,
): { newer?: PostSummary; older?: PostSummary } => {
  const index = posts.findIndex((post) => post.slug === slug)

  if (index === -1) {
    return {}
  } else return { newer: posts[index - 1], older: posts[index + 1] }
}
