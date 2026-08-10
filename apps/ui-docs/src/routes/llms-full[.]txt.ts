import { createFileRoute } from "@tanstack/react-router"

import { contentSource, getLLMText } from "@/content"

export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: async () => {
        const scan = contentSource.getPages().map(getLLMText)
        const scanned = await Promise.all(scan)

        return new Response(scanned.join("\n\n"))
      },
    },
  },
})
