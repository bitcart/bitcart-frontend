import type { SchemaEnumOverrides } from "./types"

/**
 * The member every overridden enum falls back to. The API never emits it.
 *
 * `postprocess.ts` appends a `.catch()` for it to each generated enum that lists it: a value the
 * API adds later parses into the fallback, and consumers render an unrecognized state.
 */
export const ENUM_FALLBACK = "unknown"

export const EMAIL_PATTERN = /^[^\s@"]+@[^\s@]+$/u

// FIXME: Remove once the API schema expresses a enum for this instead of a string.
/**
 * Invoice lifecycle states.
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

// FIXME: Remove once the API schema expresses a enum for this instead of a string.
/**
 * Payment deviations recorded beside an invoice's status: underpayment, overpayment, or a
 * transaction lost before confirmation.
 */
const INVOICE_EXCEPTION_STATUSES = [
  "failed_confirm",
  "none",
  "paid_over",
  "paid_partial",
  ENUM_FALLBACK,
]

// FIXME: Remove once the API schema expresses a enum for this instead of a string.
/**
 * Payout lifecycle states, from creation to a confirmed transaction.
 */
const PAYOUT_STATUSES = [
  "approved",
  "cancelled",
  "complete",
  "failed",
  "pending",
  "sent",
  ENUM_FALLBACK,
]

/**
 * The captcha providers a policy selects between.
 *
 * Excludes the fallback member: this schema also reaches the API as a request body, where the
 * list is enforced on write with a 422.
 */
const CAPTCHA_TYPES = ["cloudflare_turnstile", "hcaptcha", "none"]

//! A schema serving as another schema's default cannot be overridden here. Orval emits that
//! default as a plain object whose property widens to `string`, which no closed list accepts.
// FIXME: Remove once the API schema is consistent with the real responses.
export const SCHEMA_ENUM_OVERRIDES: SchemaEnumOverrides = {
  DisplayInvoice: { exception_status: INVOICE_EXCEPTION_STATUSES, status: INVOICE_STATUSES },
  DisplayPayout: { status: PAYOUT_STATUSES },
  Policy: { captcha_type: CAPTCHA_TYPES },
}
