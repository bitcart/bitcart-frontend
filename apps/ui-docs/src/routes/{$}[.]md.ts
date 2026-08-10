import { createFileRoute, notFound } from "@tanstack/react-router"

import { markdownPathToSlugs } from "@/common/utils"
import { contentSource, getLLMText } from "@/content"

export const Route = createFileRoute("/{$}.md")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slugs = markdownPathToSlugs(params._splat?.split("/") ?? [])
        const page = contentSource.getPage(slugs)

        if (page) {
          return new Response(await getLLMText(page), {
            headers: {
              "Content-Type": "text/markdown",
            },
          })
        } else throw notFound() as Error
      },
    },
  },
})
