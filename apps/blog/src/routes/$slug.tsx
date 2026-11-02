import { getBlogPostingJsonLd, getBreadcrumbListJsonLd } from "@bitcart/core/metadata"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { Suspense } from "react"

import { getMediaUrl } from "#/common/content/media"
import { getNeighbourPosts, getPostSummaries } from "#/common/content/posts"
import { AUTHORS, CATEGORIES } from "#/common/content/taxonomy"
import { BLOG_PUBLISHER, getAbsoluteUrl, getBlogBreadcrumb, getPageHead } from "#/common/metadata"
import { getAuthorHref, getCategoryHref, getPostHref } from "#/common/navigation"
import { preloadFeatureCover } from "#/views/posts/cover"
import { postBodyLoader, type PostBodyProps } from "#/views/posts/post-body"

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }): Promise<PostBodyProps> => {
    const posts = await getPostSummaries()
    const post = posts.find(({ slug }) => slug === params.slug)

    if (post) {
      await Promise.all([postBodyLoader.preload(post.path), preloadFeatureCover(post)])

      return { post, ...getNeighbourPosts(posts, post.slug) }
    } else throw notFound() as Error
  },

  head: ({ loaderData }) => {
    if (!loaderData) return {}

    const { post } = loaderData
    const author = AUTHORS[post.author]
    const category = CATEGORIES[post.category]
    const url = getAbsoluteUrl(getPostHref(post.slug))

    const head = getPageHead({
      routePath: getPostHref(post.slug),
      title: post.title,
      description: post.description,
      author: author.name,
      image: post.image,

      jsonLd: [
        getBlogPostingJsonLd({
          url,
          headline: post.title,
          description: post.description,
          image: getAbsoluteUrl(getMediaUrl(post.image.src)),
          datePublished: post.date,
          dateModified: post.updated,
          author: { name: author.name, url: getAbsoluteUrl(getAuthorHref(post.author)) },
          publisher: BLOG_PUBLISHER,
          blogUrl: getAbsoluteUrl("/"),
        }),

        getBreadcrumbListJsonLd([
          getBlogBreadcrumb(),
          { name: category.label, url: getAbsoluteUrl(getCategoryHref(post.category)) },
          { name: post.title, url },
        ]),
      ],
    })

    return {
      ...head,

      meta: [
        ...head.meta,
        { property: "og:type", content: "article" },
        { property: "article:published_time", content: post.date },
        ...(post.updated ? [{ property: "article:modified_time", content: post.updated }] : []),
      ],
    }
  },

  component: PostRoute,
})

function PostRoute() {
  const data = Route.useLoaderData()

  return <Suspense>{postBodyLoader.useContent(data.post.path, data)}</Suspense>
}
