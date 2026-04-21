import type { InternalHref } from "@bitcart/core/types"
import type { Url, PageContext as VikePageContext } from "vike/types"

import type { LayoutMetadata } from "@/metadata"

export type RouteUrl = Url & {
  href: InternalHref
  pathname: InternalHref
}

export type PageContextPayload = {
  localeId: string
  posixLocaleId: string
  messages: Record<string, string>
  metadata: LayoutMetadata
  urlLogical: InternalHref
  urlParsed: RouteUrl
  urlPathname: `/${string}`
}

export type PageContextOriginal = Omit<
  VikePageContext,
  "localeId" | "messages" | "metadata" | "posixLocaleId" | "urlLogical"
>

declare global {
  namespace Vike {
    interface PageContext extends PageContextPayload {
      abortReason?: string | { notAdmin: true }
    }

    interface PageContextClient extends PageContextPayload {}

    interface PageContextServer extends PageContextPayload {}
  }
}
