import type {
  CheckoutPreviewAxes,
  CheckoutPreviewReceived,
  CheckoutPreviewStatus,
} from "@bitcart/qa"

export type NormalizedPreviewAxes = Required<CheckoutPreviewAxes>

const RECEIVED_BY_STATUS: Record<CheckoutPreviewStatus, readonly CheckoutPreviewReceived[]> = {
  new: ["none", "partial", "partial-2"],
  details: ["none", "partial", "partial-2"],
  paid: ["full", "full-2", "over"],
  complete: ["full", "full-2", "over"],
  expired: ["none", "partial", "partial-2"],
  invalid: ["none", "full"],
  refunded: ["full", "full-2", "over"],
  "refund-unclaimed": ["full", "full-2", "over"],
  "refund-pending": ["full", "full-2", "over"],
  "refund-failed": ["full", "full-2", "over"],
  unknown: ["none"],
  unavailable: ["none"],
}

const LIGHTNING_RECEIVED: readonly CheckoutPreviewReceived[] = ["none", "full"]
const ANY_AMOUNT_RECEIVED: readonly CheckoutPreviewReceived[] = ["none", "over"]

export const getPreviewAxisOptions = (axes: CheckoutPreviewAxes) => {
  const method = axes.method ?? "btc"
  const isLightning = method === "lightning"
  const anyAmount = axes.anyAmount === true && !isLightning
  const hasPayments = axes.status !== "unavailable"

  return {
    received: RECEIVED_BY_STATUS[axes.status].filter(
      (received) =>
        (!isLightning || LIGHTNING_RECEIVED.includes(received)) &&
        (!anyAmount || ANY_AMOUNT_RECEIVED.includes(received)),
    ),
    anyAmount: hasPayments && !isLightning,
    discount: hasPayments && !anyAmount,
    fee: hasPayments && !anyAmount && !isLightning,
    recommendedFee: hasPayments && method === "btc",
    senderAddress: hasPayments,
  }
}

export const normalizePreviewAxes = (axes: CheckoutPreviewAxes): NormalizedPreviewAxes => {
  const options = getPreviewAxisOptions(axes)
  const [defaultReceived = "none"] = options.received

  return {
    status: axes.status,
    method: axes.method ?? "btc",
    received:
      axes.received && options.received.includes(axes.received) ? axes.received : defaultReceived,
    anyAmount: options.anyAmount && axes.anyAmount === true,
    discount: options.discount && axes.discount === true,
    fee: options.fee && axes.fee === true,
    recommendedFee: options.recommendedFee && axes.recommendedFee !== false,
    senderAddress: options.senderAddress && axes.senderAddress === true,
    longPrice: axes.longPrice === true,
    longName: axes.longName === true,
    longCoin: axes.longCoin === true,
    customLabel: axes.customLabel === true,
    duplicateCoin: axes.duplicateCoin === true,
    manyMethods: axes.manyMethods === true,
  }
}
