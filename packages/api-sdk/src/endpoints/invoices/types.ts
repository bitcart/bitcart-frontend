import type { DisplayInvoiceOutput, PaymentDataOutput } from "#/schemas"

/**
 * The API populates most payment fields at runtime: its schema types a payment as only `created`
 * and `recommended_fee`, with `additionalProperties: true`.
 */
export type InvoicePayment = PaymentDataOutput & {
  id: string
  symbol: string
  lightning: boolean
  contract: string | null
  chain_id?: number | null
  label: string
  hint: string | null
  currency: string
  amount: string
  payment_address: string
  payment_url: string
  rate: string
  rate_str: string
  name: string
  divisibility: number
  confirmations: number
}

export type Invoice = Omit<DisplayInvoiceOutput, "payments"> & {
  payments: InvoicePayment[]
}

export type InvoiceWsMessage = {
  status: InvoiceStatus
  paid_currency?: string
  tx_hashes?: string[]
  sent_amount?: string
}

export type InvoiceStatus = DisplayInvoiceOutput["status"]

export type InvoiceTerminalStatus = Extract<
  InvoiceStatus,
  "complete" | "expired" | "invalid" | "refunded"
>
