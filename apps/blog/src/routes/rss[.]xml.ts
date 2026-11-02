import { t } from "@lingui/core/macro"
import { createFileRoute } from "@tanstack/react-router"

import { BLOG_NAME, BLOG_TAGLINE, RSS_FEED_PATH } from "#/common/constants"
import { getPostSummaries } from "#/common/content/posts"
import { renderRssFeed } from "#/common/content/rss"
import { getAbsoluteUrl } from "#/common/metadata"

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(
          renderRssFeed({
            title: BLOG_NAME,
            description: t(BLOG_TAGLINE),
            siteUrl: getAbsoluteUrl("/"),
            feedUrl: getAbsoluteUrl(RSS_FEED_PATH),
            posts: await getPostSummaries(),
          }),

          { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } },
        ),
    },
  },
})
