import { getBreadcrumbListJsonLd } from "@bitcart/core/metadata"
import { createFileRoute, notFound } from "@tanstack/react-router"

import { filterPostsByCategory, getPostSummaries } from "#/common/content/posts"
import { CATEGORIES, CATEGORY_KEYS } from "#/common/content/taxonomy"
import { getAbsoluteUrl, getBlogBreadcrumb, getPageHead } from "#/common/metadata"
import { getCategoryHref } from "#/common/navigation"
import { preloadFeatureCover } from "#/views/posts/cover"
import { ListPage } from "#/views/posts/list-page"

export const Route = createFileRoute("/category/$category")({
  loader: async ({ params }) => {
    const posts = await getPostSummaries()
    const category = CATEGORY_KEYS.find((key) => key === params.category)

    const categoryPosts = category ? filterPostsByCategory(posts, category) : []

    if (category && categoryPosts.length > 0) {
      await preloadFeatureCover(categoryPosts[0])

      return { posts, category }
    } else throw notFound() as Error
  },

  head: ({ loaderData }) => {
    if (!loaderData) return {}

    const { label, description } = CATEGORIES[loaderData.category]
    const routePath = getCategoryHref(loaderData.category)

    return getPageHead({
      routePath,
      title: label,
      description,

      jsonLd: [
        getBreadcrumbListJsonLd([
          getBlogBreadcrumb(),
          { name: label, url: getAbsoluteUrl(routePath) },
        ]),
      ],
    })
  },

  component: CategoryRoute,
})

function CategoryRoute() {
  const { posts, category } = Route.useLoaderData()

  return <ListPage posts={posts} filter={{ kind: "category", key: category }} />
}
