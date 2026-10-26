import type { UnionAsArray } from "@bitcart/core/types"

import type { InvoiceTerminalStatus } from "./types"

export const TERMINAL_STATUSES: UnionAsArray<InvoiceTerminalStatus> = [
  "complete",
  "expired",
  "invalid",
  "refunded",
] as const

export const MAX_WS_RECONNECT_DELAY_MS = 30_000

export const INITIAL_WS_RECONNECT_DELAY_MS = 1_000

export const MAX_WS_RECONNECT_ATTEMPTS = 10

//* Fraction of each backoff delay that is randomized: at 0.5 the actual wait is 50% to 100% of
//* the computed backoff.
export const WS_RECONNECT_JITTER_RATIO = 0.5

//* A connection open for this long resets the backoff to its initial delay.
export const STABLE_WS_CONNECTION_DURATION_MS = 10_000
