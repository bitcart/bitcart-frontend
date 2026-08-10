import { createFileRoute } from "@tanstack/react-router"
import { llms } from "fumadocs-core/source"

import { contentSource } from "@/content"

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET() {
        return new Response(llms(contentSource).index())
      },
    },
  },
})
