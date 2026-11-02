#!/usr/bin/env node

import { getTableOfContents } from "fumadocs-core/content/toc"
import { printErrors, validateFiles } from "next-validate-link"

import { FRONTMATTER_PATTERN, getSitePages, readPostFiles } from "../src/common/content/files.ts"

const POSTS_DIR = new URL("../content/posts", import.meta.url).pathname

const RETIRED_URL_PATTERN =
  /https?:\/\/(?:[\w-]+\.)*bitcartcc\.com|https?:\/\/(?:github\.com|t\.me)\/bitcartcc\b/gi

const posts = readPostFiles(POSTS_DIR)

console.info(`✓ ${posts.length} posts match the frontmatter schema`)

const urls = new Map(getSitePages(posts).map(({ path }) => [path, {}]))

for (const { slug, source } of posts) {
  const hashes = getTableOfContents(source.replace(FRONTMATTER_PATTERN, "")).map(({ url }) =>
    url.slice(1),
  )

  urls.set(`/${slug}`, { hashes })
}

//! next-validate-link skips links without a path, so in-page anchors get their page prepended.
const files = posts.map(({ slug, source }) => ({
  path: `${POSTS_DIR}/${slug}.mdx`,
  content: source.replaceAll("](#", `](/${slug}#`),
  url: `/${slug}`,
}))

printErrors(await validateFiles(files, { scanned: { urls, fallbackUrls: [] } }), true)

console.info("✓ Every internal link and anchor resolves")

const retiredUrls = files.flatMap(({ path, content }) =>
  content
    .split("\n")
    .flatMap((line, index) =>
      Array.from(line.matchAll(RETIRED_URL_PATTERN), ([url]) => `${path}:${index + 1}: ${url}`),
    ),
)

if (retiredUrls.length > 0) {
  console.error(`Links to retired BitcartCC addresses:\n${retiredUrls.join("\n")}`)
  process.exit(1)
} else console.info("✓ No links to retired BitcartCC addresses")
