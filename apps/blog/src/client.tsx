import { configurePlausible } from "@bitcart/core/telemetry"
import { StartClient } from "@tanstack/react-start/client"
import { StrictMode, startTransition } from "react"
import { hydrateRoot } from "react-dom/client"

import { IS_PLAUSIBLE_ENABLED, PRODUCTION_BASE_URL } from "#/common/constants"
import { env } from "#/env"
import { preloadPostBodyAt } from "#/views/posts/post-body"

configurePlausible({
  enabled: IS_PLAUSIBLE_ENABLED,
  domain: new URL(PRODUCTION_BASE_URL).hostname,
  endpoint: env.BITCART_PLAUSIBLE_ENDPOINT,
})

//! Loaders don't rerun on hydration: without this, React swaps the prerendered body for an empty
//! fallback until the body's chunk arrives.
await preloadPostBodyAt(window.location.pathname)

startTransition(() => {
  hydrateRoot(
    document,

    <StrictMode>
      <StartClient />
    </StrictMode>,
  )
})
