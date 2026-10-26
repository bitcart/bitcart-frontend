export const CHECKOUT_PREVIEW_STATUSES = [
  "new",
  "details",
  "paid",
  "complete",
  "expired",
  "invalid",
  "refunded",
  "refund-unclaimed",
  "refund-pending",
  "refund-failed",
  "unknown",
  "unavailable",
] as const

export type CheckoutPreviewStatus = (typeof CHECKOUT_PREVIEW_STATUSES)[number]

export const DEFAULT_CHECKOUT_PREVIEW_STATUS: CheckoutPreviewStatus = "new"

export const CHECKOUT_PREVIEW_RECEIVED = [
  "none",
  "partial",
  "partial-2",
  "full",
  "full-2",
  "over",
] as const

export type CheckoutPreviewReceived = (typeof CHECKOUT_PREVIEW_RECEIVED)[number]

export const CHECKOUT_PREVIEW_METHODS = ["btc", "lightning", "eth", "usdt"] as const

export type CheckoutPreviewMethod = (typeof CHECKOUT_PREVIEW_METHODS)[number]

export const CHECKOUT_PREVIEW_EXPIRATIONS = [
  "15m",
  "10m-left",
  "6m-left",
  "5m-left",
  "30s-left",
  "2h",
  "2d",
  "6d",
  "7d",
] as const

export type CheckoutPreviewExpiration = (typeof CHECKOUT_PREVIEW_EXPIRATIONS)[number]

export type CheckoutPreviewAxes = {
  status: CheckoutPreviewStatus
  received?: CheckoutPreviewReceived
  method?: CheckoutPreviewMethod
  discount?: boolean
  fee?: boolean
  anyAmount?: boolean
  recommendedFee?: boolean
  senderAddress?: boolean
  longPrice?: boolean
  longName?: boolean
  longCoin?: boolean
  customLabel?: boolean
  duplicateCoin?: boolean
  manyMethods?: boolean
}

export type CheckoutPreviewCase = CheckoutPreviewAxes & {
  expiration?: CheckoutPreviewExpiration
}

export const CHECKOUT_PREVIEW_CASES = {
  new: { status: "new" },
  expiring: { status: "new", expiration: "30s-left" },
  lightning: { status: "new", method: "lightning" },
  "zero-price": { status: "new", anyAmount: true },
  discount: { status: "new", discount: true },
  "network-fee": { status: "new", fee: true },
  details: { status: "details" },
  "sender-address": { status: "new", method: "eth", senderAddress: true },
  partial: { status: "new", received: "partial" },
  "partial-split": { status: "new", received: "partial-2", fee: true },
  "partial-split-discount": { status: "new", received: "partial-2", fee: true, discount: true },
  unavailable: { status: "unavailable" },
  paid: { status: "paid" },
  complete: { status: "complete" },
  "complete-split": { status: "complete", received: "full-2" },
  "complete-lightning": { status: "complete", method: "lightning" },
  "complete-discount": { status: "complete", discount: true, fee: true },
  "complete-zero-price": { status: "complete", received: "over", anyAmount: true },
  overpaid: { status: "complete", received: "over" },
  expired: { status: "expired" },
  "expired-partial": { status: "expired", received: "partial" },
  invalid: { status: "invalid" },
  "failed-confirm": { status: "invalid", received: "full" },
  refunded: { status: "refunded" },
  "refund-unclaimed": { status: "refund-unclaimed" },
  "refund-pending": { status: "refund-pending" },
  "refund-failed": { status: "refund-failed" },
  unknown: { status: "unknown" },
} as const satisfies Record<string, CheckoutPreviewCase>

export type CheckoutPreviewCaseId = keyof typeof CHECKOUT_PREVIEW_CASES

export const CHECKOUT_PREVIEW_CASE_IDS = Object.keys(
  CHECKOUT_PREVIEW_CASES,
) as CheckoutPreviewCaseId[]

export const checkoutPreviewCaseQuery = (previewCase: CheckoutPreviewCase): string =>
  new URLSearchParams(
    Object.entries(previewCase).map(([axis, value]): [string, string] => [axis, String(value)]),
  ).toString()

export const CHECKOUT_PREVIEW_VIEWS = ["checkout", "receipt"] as const

export type CheckoutPreviewView = (typeof CHECKOUT_PREVIEW_VIEWS)[number]

export const CHECKOUT_PREVIEW_ENVIRONMENTS = [
  "terminal",
  "terminal-out-of-paper",
  "terminal-no-printer",
] as const

export type CheckoutPreviewEnvironment = (typeof CHECKOUT_PREVIEW_ENVIRONMENTS)[number]

export const CHECKOUT_PREVIEW_WALLETS = [
  "one",
  "two",
  "rejects",
  "wrong-network",
  "low-balance",
  "no-gas",
  "busy",
  "fails",
] as const

export type CheckoutPreviewWallet = (typeof CHECKOUT_PREVIEW_WALLETS)[number]
