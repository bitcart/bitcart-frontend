import type { PageContext as VikePageContext } from "vike/types"

import type { LayoutMetadata } from "@/metadata"

export type PageContextPayload = {
  localeId: string
  posixLocaleId: string
  messages: Record<string, string>
  metadata: LayoutMetadata
  urlLogical: string
}

export type PageContextOriginal = Omit<
  VikePageContext,
  "localeId" | "messages" | "metadata" | "posixLocaleId" | "urlLogical"
>

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vike {
    interface PageContext extends PageContextPayload {
      abortReason?: string | { notAdmin: true }
    }

    interface PageContextServer extends PageContextPayload {}
  }
}
