import { createPagePreloader } from "@bitcart/tanstack-start-kit/fumadocs"
import browserCollections from "collections/browser"

import type { PostSummary } from "#/common/content/posts"

import { MDX_COMPONENTS } from "./mdx-components"
import { PostPage } from "./post-page"

export type PostBodyProps = {
  post: PostSummary
  newer?: PostSummary
  older?: PostSummary
}

export const postBodyLoader = browserCollections.posts.createClientLoader({
  component: ({ default: MDX }, { post, newer, older }: PostBodyProps) => (
    <PostPage post={post} newer={newer} older={older}>
      <MDX components={MDX_COMPONENTS} />
    </PostPage>
  ),
})

export const preloadPostBodyAt = createPagePreloader(browserCollections.posts, postBodyLoader)
