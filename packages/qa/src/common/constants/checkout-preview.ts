export const CHECKOUT_PREVIEW_STATUSES = [
  "new",
  "details",
  "partial",
  "paid",
  "complete",
  "expired",
  "invalid",
  "refunded",
  "unavailable",
] as const

export type CheckoutPreviewStatus = (typeof CHECKOUT_PREVIEW_STATUSES)[number]

export const DEFAULT_CHECKOUT_PREVIEW_STATUS: CheckoutPreviewStatus = "new"
