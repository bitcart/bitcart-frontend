import type { SchemaEnumOverrides } from "./types"

/**
 * The member every overridden enum falls back to. The API never emits it.
 *
 * `postprocess.ts` appends a `.catch()` for it to each generated enum that lists it: a value the
 * API adds later parses into the fallback, and consumers render an unrecognized state.
 */
export const ENUM_FALLBACK = "unknown"

// FIXME: Remove once the API schema expresses a enum for this instead of a string.
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
const INVOICE_EXCEPTION_STATUSES = [
  "failed_confirm",
  "none",
  "paid_over",
  "paid_partial",
  ENUM_FALLBACK,
]

// FIXME: Remove once the API schema expresses a enum for this instead of a string.
const PAYOUT_STATUSES = [
  "approved",
  "cancelled",
  "complete",
  "failed",
  "pending",
  "sent",
  ENUM_FALLBACK,
]

// FIXME: Remove once the API schema expresses a enum for this instead of a string.
const CAPTCHA_TYPES = ["cloudflare_turnstile", "hcaptcha", "none"]

// FIXME: Remove once the API schema expresses a enum for this instead of a string.
const SMTP_AUTH_MODES = ["none", "ssl/tls", "starttls"]

// FIXME: Remove once the API schema is consistent with the real responses.
export const SCHEMA_ENUM_OVERRIDES: SchemaEnumOverrides = {
  DisplayInvoice: { exception_status: INVOICE_EXCEPTION_STATUSES, status: INVOICE_STATUSES },
  DisplayPayout: { status: PAYOUT_STATUSES },
  EmailSettings: { auth_mode: SMTP_AUTH_MODES },
  Policy: { captcha_type: CAPTCHA_TYPES },
}
