import { createFileRoute } from "@tanstack/react-router"
import { createFromSource } from "fumadocs-core/search/server"

import { contentSource } from "@/content"

const server = createFromSource(contentSource, {
  // https://docs.orama.com/docs/orama-js/supported-languages
  language: "english",
})

export const Route = createFileRoute("/api/search")({
  server: {
    handlers: {
      GET: () => server.staticGET(),
    },
  },
})
