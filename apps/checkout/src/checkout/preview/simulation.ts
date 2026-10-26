import type { SocketConnectionHandle } from "@bitcart/core/types"
import type { CheckoutPreviewAxes } from "@bitcart/qa"
import { isDeepEqual } from "remeda"

import { normalizePreviewAxes, type NormalizedPreviewAxes } from "./axes"

export type PreviewAction = { label: string; next: NormalizedPreviewAxes }

const getCandidates = (axes: NormalizedPreviewAxes): [string, Partial<CheckoutPreviewAxes>][] => {
  const { status, received } = axes
  const isPending = status === "new" || status === "details"

  if (isPending && received === "none") {
    return [
      ["Pay in part", { received: "partial" }],
      ["Pay in full", { status: "paid", received: "full" }],
      ["Overpay", { status: "paid", received: "over" }],
      ["Expire", { status: "expired" }],
    ]
  } else if (isPending && received === "partial") {
    return [
      ["Pay in part again", { received: "partial-2" }],
      ["Pay the rest", { status: "paid", received: "full-2" }],
      ["Expire", { status: "expired" }],
    ]
  } else if (isPending) {
    return [
      ["Pay the rest", { status: "paid", received: "full-2" }],
      ["Expire", { status: "expired" }],
    ]
  } else if (status === "paid") {
    return [
      ["Confirm", { status: "complete" }],
      ["Drop from mempool", { status: "invalid", received: "full" }],
    ]
  } else if (status === "complete") {
    return [["Start refund", { status: "refund-unclaimed" }]]
  } else if (status === "refund-unclaimed") {
    return [["Submit address", { status: "refund-pending" }]]
  } else if (status === "refund-pending") {
    return [
      ["Send refund", { status: "refunded" }],
      ["Refund fails", { status: "refund-failed" }],
    ]
  } else return []
}

export const getPreviewActions = (axes: NormalizedPreviewAxes): PreviewAction[] =>
  getCandidates(axes).flatMap(([label, change]) => {
    const requested = { ...axes, ...change }
    const next = normalizePreviewAxes(requested)

    return isDeepEqual(next, requested) ? [{ label, next }] : []
  })

export const PREVIEW_CONNECTIONS = ["connected", "reconnecting", "offline", "gave-up"] as const

export type PreviewConnection = (typeof PREVIEW_CONNECTIONS)[number]

export const toPreviewConnectionHandle = (
  connection: PreviewConnection,
  reconnect: () => void,
): SocketConnectionHandle => ({
  isConnected: connection === "connected",
  isClientOnline: connection !== "offline",
  isReconnecting: connection === "reconnecting",
  isReconnectLimitReached: connection === "gave-up",
  reconnect,
})
