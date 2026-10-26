import type { HttpHref } from "@bitcart/core/navigation"
import { useEffect } from "react"

import type { CheckoutAppConfig } from "#/checkout/runtime/context"

import { getEmbedHost } from "./host"

export const EMBED_APP_CONFIG: Required<
  Pick<CheckoutAppConfig, "close" | "redirect" | "openPage">
> = {
  close: () => getEmbedHost().close(),
  redirect: (url: HttpHref) => getEmbedHost().returnToStore(url),
  openPage: (href) => void window.open(href, "_blank", "noopener"),
}

export const useEmbedEscapeClose = (isEmbedded: boolean): void => {
  useEffect(() => {
    if (!isEmbedded) return void null

    const host = getEmbedHost()

    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented && !event.isComposing) host.close()
    }

    window.addEventListener("keydown", listener)

    return () => window.removeEventListener("keydown", listener)
  }, [isEmbedded])
}
