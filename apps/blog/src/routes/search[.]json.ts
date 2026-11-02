import { createFileRoute } from "@tanstack/react-router"
import { createFromSource } from "fumadocs-core/search/server"

import { postSource } from "#/common/content/source"

const searchServer = createFromSource(postSource, { language: "english" })

export const Route = createFileRoute("/search.json")({
  server: {
    handlers: {
      GET: () => searchServer.staticGET(),
    },
  },
})
