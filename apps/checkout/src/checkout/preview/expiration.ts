import type { CheckoutPreviewExpiration } from "@bitcart/qa"

import type { CheckoutSource } from "../model"

type CheckoutPreviewTimes = { lifetimeSeconds: number; secondsLeft: number }

const PREVIEW_EXPIRATION_TIMES = {
  "15m": { lifetimeSeconds: 900, secondsLeft: 900 },
  "10m-left": { lifetimeSeconds: 900, secondsLeft: 600 },
  "6m-left": { lifetimeSeconds: 900, secondsLeft: 360 },
  "5m-left": { lifetimeSeconds: 900, secondsLeft: 300 },
  "30s-left": { lifetimeSeconds: 900, secondsLeft: 30 },
  "2h": { lifetimeSeconds: 7200, secondsLeft: 7200 },
  "2d": { lifetimeSeconds: 172_800, secondsLeft: 172_800 },
  "6d": { lifetimeSeconds: 518_400, secondsLeft: 518_400 },
  "7d": { lifetimeSeconds: 604_800, secondsLeft: 604_800 },
} satisfies Record<CheckoutPreviewExpiration, CheckoutPreviewTimes>

const CHECKOUT_PREVIEW_SPEEDS = {
  "2x": 2,
  "3x": 3,
  "5x": 5,
  "10x": 10,
  "30x": 30,
  "60x": 60,
} satisfies Record<string, number>

export type CheckoutPreviewSpeed = keyof typeof CHECKOUT_PREVIEW_SPEEDS

export const CHECKOUT_PREVIEW_SPEED_IDS = Object.keys(
  CHECKOUT_PREVIEW_SPEEDS,
) as CheckoutPreviewSpeed[]

export const getPreviewSpeed = (speed: CheckoutPreviewSpeed | undefined): number =>
  speed ? CHECKOUT_PREVIEW_SPEEDS[speed] : 1

export const withPreviewExpiration = (
  invoice: CheckoutSource["invoice"],
  expiration: CheckoutPreviewExpiration | undefined,
): CheckoutSource["invoice"] => {
  if (!expiration || invoice.status !== "pending") return invoice

  const { lifetimeSeconds, secondsLeft } = PREVIEW_EXPIRATION_TIMES[expiration]

  return { ...invoice, expiration_seconds: lifetimeSeconds, time_left: secondsLeft }
}

export const datePreviewInvoice = (
  invoice: CheckoutSource["invoice"],
  now: number,
): CheckoutSource["invoice"] => {
  if (invoice.status !== "pending") return invoice

  const elapsedSeconds = invoice.expiration_seconds - invoice.time_left

  return { ...invoice, created: new Date(now - elapsedSeconds * 1000).toISOString() }
}
