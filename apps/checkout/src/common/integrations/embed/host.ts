import type { bitcartInvoices } from "@bitcart/client-sdk/endpoints"
import { isNotFoundError } from "@bitcart/client-sdk/utils"
import type { HttpHref } from "@bitcart/core/navigation"
import { isDeepEqual } from "remeda"
import * as z from "zod"

import {
  EMBED_PROTOCOL_VERSION,
  type EmbedError,
  type EmbedFrameMessage,
  type EmbedHelloMessage,
  type EmbedInvoiceState,
} from "./protocol"

const embedConnectMessageSchema = z.object({
  v: z.literal(EMBED_PROTOCOL_VERSION),
  type: z.literal("connect"),
})

export type EmbedHost = {
  report: (invoice: bitcartInvoices.Invoice) => void
  returnToStore: (url: HttpHref) => void
  close: () => void
  fail: (invoiceId: string, error: unknown) => void
}

const toInvoiceState = ({
  id,
  status,
  exception_status,
  sent_amount,
  sent_price,
  currency,
  paid_currency,
  payment_id,
}: bitcartInvoices.Invoice): EmbedInvoiceState => ({
  invoice_id: id,
  status,
  exception_status,
  sent_amount,
  sent_price,
  currency,
  paid_currency,
  payment_id,
})

export const createEmbedHost = (frame: Window = window): EmbedHost => {
  let port: MessagePort | null = null
  let reported: EmbedInvoiceState | null = null
  let failure: EmbedError | null = null
  const pending: EmbedFrameMessage[] = []

  const post = (message: EmbedFrameMessage) => {
    if (port) {
      port.postMessage(message)
    } else pending.push(message)
  }

  const handleConnect = ({ source, data, ports: [received] }: MessageEvent<unknown>) => {
    if (source === frame.parent && received && embedConnectMessageSchema.safeParse(data).success) {
      frame.removeEventListener("message", handleConnect)
      port = received

      for (const message of pending.splice(0)) received.postMessage(message)
    }
  }

  frame.addEventListener("message", handleConnect)

  frame.parent.postMessage(
    { v: EMBED_PROTOCOL_VERSION, type: "hello" } satisfies EmbedHelloMessage,
    "*",
  )

  return {
    report: (invoice) => {
      const state = toInvoiceState(invoice)
      const previous = reported

      reported = state
      failure = null

      if (!previous) {
        post({ v: EMBED_PROTOCOL_VERSION, type: "ready", payload: state })
      } else if (!isDeepEqual(state, previous)) {
        post({ v: EMBED_PROTOCOL_VERSION, type: "status", payload: state })

        if (state.status === "expired" && previous.status !== "expired") {
          post({ v: EMBED_PROTOCOL_VERSION, type: "expired", payload: state })
        }
      }
    },

    returnToStore: (url) => {
      if (reported) {
        post({
          v: EMBED_PROTOCOL_VERSION,
          type: "complete",
          payload: { ...reported, redirect_url: url },
        })
      }
    },

    close: () => post({ v: EMBED_PROTOCOL_VERSION, type: "close" }),

    fail: (invoiceId, error) => {
      const next: EmbedError = {
        invoice_id: invoiceId,
        reason: isNotFoundError(error) ? "not_found" : "load_failed",
      }

      if (!isDeepEqual(next, failure)) {
        failure = next
        post({ v: EMBED_PROTOCOL_VERSION, type: "error", payload: next })
      }
    },
  }
}

let host: EmbedHost | null = null

export const getEmbedHost = (): EmbedHost => (host ??= createEmbedHost())

export const isEmbeddedByLoader = ({ embed }: { embed?: unknown }): boolean =>
  embed === "v1" && typeof window !== "undefined" && window.parent !== window
