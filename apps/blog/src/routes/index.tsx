import { getBlogJsonLd } from "@bitcart/core/metadata"
import { t } from "@lingui/core/macro"
import { createFileRoute } from "@tanstack/react-router"

import { BLOG_NAME, BLOG_TAGLINE } from "#/common/constants"
import { getPostSummaries } from "#/common/content/posts"
import { BLOG_PUBLISHER, getAbsoluteUrl, getPageHead } from "#/common/metadata"
import { preloadFeatureCover } from "#/views/posts/cover"
import { ListPage } from "#/views/posts/list-page"

export const Route = createFileRoute("/")({
  loader: async () => {
    const posts = await getPostSummaries()

    await preloadFeatureCover(posts[0])

    return posts
  },

  head: () => {
    const description = t(BLOG_TAGLINE)

    return getPageHead({
      routePath: "/",
      description,

      jsonLd: [
        getBlogJsonLd({
          url: getAbsoluteUrl("/"),
          name: BLOG_NAME,
          description,
          publisher: BLOG_PUBLISHER,
        }),
      ],
    })
  },

  component: IndexRoute,
})

function IndexRoute() {
  const posts = Route.useLoaderData()

  return <ListPage posts={posts} filter={{ kind: "all" }} />
}
