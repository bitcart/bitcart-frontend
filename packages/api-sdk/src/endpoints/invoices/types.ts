import type { DisplayInvoiceOutput, PaymentDataOutput } from "#/schemas"

/**
 * The API types a payment as just `created` and `recommended_fee`, then fills the rest in at
 * runtime, which is why the schema carries `additionalProperties: true`. These are the fields
 * checkout renders, and they stay hand-written until the backend declares them.
 */
export type InvoicePayment = PaymentDataOutput & {
  currency: string
  amount: string
  payment_address: string
  payment_url: string
  rate: string
  rate_str: string
  name: string
  already_paid: string
  due: string
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
