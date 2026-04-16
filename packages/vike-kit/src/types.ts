import type { InternalHref } from "@bitcart/core/types"
import type { PageContext as VikePageContext } from "vike/types"

import type { LayoutMetadata } from "@/metadata"

export type PageContextPayload = {
  localeId: string
  posixLocaleId: string
  messages: Record<string, string>
  metadata: LayoutMetadata
  urlLogical: InternalHref
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

    interface PageContextServer extends PageContextPayload {}
  }
}
