import type { bitcartInvoices, bitcartStores } from "@bitcart/api-sdk/endpoints"

export type CheckoutTemplateProps = {
  invoice: bitcartInvoices.Invoice
  store: bitcartStores.Store
  currentStatus: bitcartInvoices.InvoiceStatus
  selectedPaymentIndex: number
  setSelectedPaymentIndex: (index: number) => void
  countdownFormatted: string
}
