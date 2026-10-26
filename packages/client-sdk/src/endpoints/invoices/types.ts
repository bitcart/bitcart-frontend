import type { DisplayInvoiceOutput, DisplayRefundOutput, PaymentDataOutput } from "#/schemas"

/**
 * The API populates most payment fields at runtime: its schema types a payment as only `created`,
 * `recommended_fee` and `wallet`, with `additionalProperties: true`.
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
  name: string
  divisibility: number
  confirmations: number
  discount: string | null
  applied_discount: InvoiceAppliedDiscount | null
  effective_price: string
  network_fee: string
  subtotal: string
  due: string
  due_price: string

  user_address: string | null
  node_id: string | null
}

export type InvoiceAppliedDiscount = {
  name: string
  percent: number
}

export type Invoice = Omit<DisplayInvoiceOutput, "payments"> & {
  payments: InvoicePayment[]
}

export type InvoiceRefund = DisplayRefundOutput

export type InvoiceWsMessage = {
  status: InvoiceStatus
  exception_status: InvoiceExceptionStatus
  sent_amount: string
  paid_currency: string | null
  payment_id: string | null
}

export type InvoiceStatus = DisplayInvoiceOutput["status"]

export type InvoiceExceptionStatus = DisplayInvoiceOutput["exception_status"]

export type InvoiceTerminalStatus = Extract<
  InvoiceStatus,
  "complete" | "expired" | "invalid" | "refunded"
>
