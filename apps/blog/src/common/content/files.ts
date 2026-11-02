import { readdirSync, readFileSync } from "node:fs"
import { basename, join } from "node:path"

import { parse } from "yaml"
import { z } from "zod"

import { postFrontmatterSchema, type PostFrontmatter } from "./schema.ts"

export const FRONTMATTER_PATTERN = /^---\n([\s\S]*?)\n---\n/

export type PostFile = {
  slug: string
  frontmatter: PostFrontmatter
  source: string
}

export const readPostFiles = (postsDir: string): PostFile[] => {
  const files = readdirSync(postsDir).filter((file) => file.endsWith(".mdx"))
  const issues: string[] = []

  const postFiles = files.flatMap((file): PostFile[] => {
    const source = readFileSync(join(postsDir, file), "utf8")

    const result = postFrontmatterSchema.safeParse(
      parse(source.match(FRONTMATTER_PATTERN)?.[1] ?? ""),
    )

    if (result.success) {
      return [{ slug: basename(file, ".mdx"), frontmatter: result.data, source }]
    } else {
      issues.push(`${file}:\n${z.prettifyError(result.error)}`)

      return []
    }
  })

  if (issues.length > 0) {
    throw new Error(`Invalid post frontmatter in ${postsDir}:\n\n${issues.join("\n\n")}`)
  } else return postFiles
}

export type SitePage = {
  path: string
  lastmod: string
}

const getNewestDate = (posts: PostFile[]) =>
  posts
    .map(({ frontmatter }) => frontmatter.updated ?? frontmatter.date)
    .toSorted()
    .at(-1) ?? ""

const groupPostsBy = (posts: PostFile[], key: "author" | "category") =>
  Object.entries(Object.groupBy(posts, ({ frontmatter }) => frontmatter[key]))

export const getSitePages = (posts: PostFile[]): SitePage[] => [
  { path: "/", lastmod: getNewestDate(posts) },

  ...posts.map(({ slug, frontmatter }) => ({
    path: `/${slug}`,
    lastmod: frontmatter.updated ?? frontmatter.date,
  })),

  ...groupPostsBy(posts, "category").map(([category, categoryPosts]) => ({
    path: `/category/${category}`,
    lastmod: getNewestDate(categoryPosts),
  })),

  ...groupPostsBy(posts, "author").map(([author, authorPosts]) => ({
    path: `/author/${author}`,
    lastmod: getNewestDate(authorPosts),
  })),
]
