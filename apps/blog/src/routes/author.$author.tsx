import { createFileRoute, notFound } from "@tanstack/react-router"

import { filterPostsByAuthor, getPostSummaries } from "#/common/content/posts"
import { AUTHOR_KEYS, AUTHORS } from "#/common/content/taxonomy"
import { getPageHead } from "#/common/metadata"
import { getAuthorHref } from "#/common/navigation"
import { preloadFeatureCover } from "#/views/posts/cover"
import { ListPage } from "#/views/posts/list-page"

export const Route = createFileRoute("/author/$author")({
  loader: async ({ params }) => {
    const posts = await getPostSummaries()
    const author = AUTHOR_KEYS.find((key) => key === params.author)

    const authorPosts = author ? filterPostsByAuthor(posts, author) : []

    if (author && authorPosts.length > 0) {
      await preloadFeatureCover(authorPosts[0])

      return { posts, author }
    } else throw notFound() as Error
  },

  head: ({ loaderData }) => {
    if (!loaderData) return {}

    const { name, bio, avatarSrc } = AUTHORS[loaderData.author]

    return getPageHead({
      routePath: getAuthorHref(loaderData.author),
      title: name,
      description: bio,
      image: avatarSrc ? { src: avatarSrc, alt: name } : undefined,
    })
  },

  component: AuthorRoute,
})

function AuthorRoute() {
  const { posts, author } = Route.useLoaderData()

  return <ListPage posts={posts} filter={{ kind: "author", key: author }} />
}
