import type { bitcartInvoices } from "@bitcart/client-sdk/endpoints"

import { getReceiptRefund, type CheckoutReceiptRefund } from "../model"

export type CheckoutRefundMethod = {
  name: string
  symbol: string
  lightning: boolean
}

export type CheckoutRefundSubmitOutcome = "accepted" | "rejected"

export type CheckoutRefundPage = {
  refund: CheckoutReceiptRefund
  destination: string | null
  method: CheckoutRefundMethod | null
  submit: (destination: string) => Promise<CheckoutRefundSubmitOutcome>
}

const getRefundMethod = (invoice: bitcartInvoices.Invoice): CheckoutRefundMethod | null => {
  const paidMethod = invoice.payments.find(({ id }) => id === invoice.payment_id)

  return paidMethod
    ? { name: paidMethod.name, symbol: paidMethod.symbol, lightning: paidMethod.lightning }
    : null
}

export const getRefundPage = (
  refund: bitcartInvoices.InvoiceRefund,
  invoice: bitcartInvoices.Invoice,
  explorerUrls: Record<string, string>,
  submit: CheckoutRefundPage["submit"],
): CheckoutRefundPage => ({
  refund: getReceiptRefund(refund, explorerUrls),
  destination: refund.destination,
  method: getRefundMethod(invoice),
  submit,
})

export const getRefundAddressCoin = (method: CheckoutRefundMethod | null): string | null => {
  if (!method) {
    return null
  } else if (method.lightning) {
    return method.symbol.toUpperCase()
  } else return method.name
}

export const isConvertedRefund = (
  refund: Pick<CheckoutReceiptRefund, "currency">,
  method: CheckoutRefundMethod | null,
): boolean => method !== null && refund.currency.toLowerCase() !== method.symbol.toLowerCase()
