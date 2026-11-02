import type { PostSummary } from "./posts"
import { CATEGORIES } from "./taxonomy"

const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
}

const escapeXml = (value: string) => value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char)

const toRfc822Date = (isoDate: string) => new Date(isoDate).toUTCString()

export type RssFeedParams = {
  title: string
  description: string
  siteUrl: string
  feedUrl: string
  posts: PostSummary[]
}

export const renderRssFeed = ({ title, description, siteUrl, feedUrl, posts }: RssFeedParams) => {
  const items = posts.map((post) => {
    const url = `${siteUrl}/${post.slug}`

    return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${toRfc822Date(post.date)}</pubDate>
      <description>${escapeXml(post.description)}</description>
      <category>${escapeXml(CATEGORIES[post.category].label)}</category>
    </item>`
  })

  const lastBuildDate = posts[0]
    ? `\n    <lastBuildDate>${toRfc822Date(posts[0].date)}</lastBuildDate>`
    : ""

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(description)}</description>
    <language>en</language>${lastBuildDate}
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>${items.join("")}
  </channel>
</rss>
`
}
