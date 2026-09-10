import { TERMINAL_STATUSES } from "../constants"
import type { InvoiceStatus, InvoiceTerminalStatus } from "../types"

export const isTerminalStatus = (status: InvoiceStatus): status is InvoiceTerminalStatus =>
  TERMINAL_STATUSES.includes(status as InvoiceTerminalStatus)
