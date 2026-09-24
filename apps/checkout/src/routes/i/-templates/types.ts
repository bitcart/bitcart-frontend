import type { bitcartInvoices, bitcartStores } from "@bitcart/api-sdk/endpoints"

export type CheckoutTemplateProps = {
  activePaymentMethodIndex: number
  countdownFormatted: string
  currentStatus: bitcartInvoices.InvoiceStatus
  invoice: bitcartInvoices.Invoice
  invoiceWsConnectionHandle: bitcartInvoices.UseInvoiceWebsocketResult
  onPaymentMethodSelect: (index: number) => void
  store: bitcartStores.Store
}
