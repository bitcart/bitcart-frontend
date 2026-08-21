import type { Invoice, InvoiceStatus, Store } from "#/common/data/bitcart/types"

export type CheckoutTemplateProps = {
  invoice: Invoice
  store: Store
  currentStatus: InvoiceStatus
  selectedPaymentIndex: number
  setSelectedPaymentIndex: (index: number) => void
  countdownFormatted: string
}
