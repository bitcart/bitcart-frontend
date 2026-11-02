import { posts } from "collections/server"
import { loader } from "fumadocs-core/source"
import { toFumadocsSource } from "fumadocs-mdx/runtime/server"

export const postSource = loader({
  baseUrl: "/",
  source: toFumadocsSource(posts, []),
})
