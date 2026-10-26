import type { bitcartInvoices } from "@bitcart/client-sdk/endpoints"
import type { HttpHref } from "@bitcart/core/navigation"

export const EMBED_PROTOCOL_VERSION = 1

export type EmbedInvoiceState = Pick<
  bitcartInvoices.Invoice,
  "status" | "exception_status" | "sent_amount" | "paid_currency" | "payment_id"
> & { invoice_id: string }

export type EmbedError = { invoice_id: string; reason: "not_found" | "load_failed" }

type EmbedMessage<Type extends string, Payload = never> = [Payload] extends [never]
  ? { v: typeof EMBED_PROTOCOL_VERSION; type: Type }
  : { v: typeof EMBED_PROTOCOL_VERSION; type: Type; payload: Payload }

//* Posted to the parent window with any target origin: it carries no data.
export type EmbedHelloMessage = EmbedMessage<"hello">

//* Posted by the loader to the frame window, transferring the port every later message uses.
export type EmbedConnectMessage = EmbedMessage<"connect">

export type EmbedFrameMessage =
  | EmbedMessage<"ready", EmbedInvoiceState>
  | EmbedMessage<"status", EmbedInvoiceState>
  | EmbedMessage<"expired", EmbedInvoiceState>
  | EmbedMessage<"complete", EmbedInvoiceState & { redirect_url: HttpHref }>
  | EmbedMessage<"close">
  | EmbedMessage<"error", EmbedError>
