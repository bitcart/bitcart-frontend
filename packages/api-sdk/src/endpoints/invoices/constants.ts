import type { UnionAsArray } from "@bitcart/core/types"

import type { InvoiceTerminalStatus } from "./types"

export const TERMINAL_STATUSES: UnionAsArray<InvoiceTerminalStatus> = [
  "complete",
  "expired",
  "invalid",
  "refunded",
] as const

export const MAX_WS_RECONNECT_DELAY = 30_000

export const INITIAL_WS_RECONNECT_DELAY = 1_000
