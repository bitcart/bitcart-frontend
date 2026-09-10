import type { SchemaEnumOverrides } from "./types"

/**
 * The member every overridden enum falls back to. The API never emits it.
 *
 * `postprocess.ts` appends a `.catch()` for it to each generated enum that lists it: a value the
 * API adds later parses into the fallback, and consumers render an unrecognized state.
 */
export const ENUM_FALLBACK = "unknown"

/**
 * The API types `status` as an open string; these are the values it actually emits.
 *
 * Overriding the schema also enforces the list at runtime: `runtimeValidation` parses every
 * response through the generated Zod schema, and a value outside the list fails the parse. The
 * fallback member absorbs that failure.
 */
const INVOICE_STATUSES = [
  "complete",
  "confirmed",
  "expired",
  "invalid",
  "paid",
  "pending",
  "refunded",
  "unconfirmed",
  ENUM_FALLBACK,
]

// TODO: Remove once the API schema is consistent with the real responses.
export const SCHEMA_ENUM_OVERRIDES: SchemaEnumOverrides = {
  DisplayInvoice: { status: INVOICE_STATUSES },
}
