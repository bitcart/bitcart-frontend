import { StartClient } from "@tanstack/react-start/client"
import { StrictMode, startTransition } from "react"
import { hydrateRoot } from "react-dom/client"

import { preloadDocPageAt } from "@/routes/-layout/doc-page"

//! Loaders don't rerun on hydration: without this, React swaps the prerendered page for an empty
//! fallback until the page's chunk arrives.
await preloadDocPageAt(window.location.pathname)

startTransition(() => {
  hydrateRoot(
    document,

    <StrictMode>
      <StartClient />
    </StrictMode>,
  )
})
