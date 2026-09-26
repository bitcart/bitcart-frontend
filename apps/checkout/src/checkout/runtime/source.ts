import { bitcartInvoices, bitcartManage, bitcartStores } from "@bitcart/api-sdk/endpoints"
import type { CustomerUpdateData } from "@bitcart/api-sdk/schemas"
import type { SocketConnectionHandle } from "@bitcart/core/types"
import { useCallback } from "react"
import { isDefined } from "remeda"

import type { CheckoutSource } from "../model"

const INVOICE_DATA_REFETCH_INTERVAL_MS = 30_000

/**
 * Loads the data required by an invoice's checkout and keeps it current. Suspends until the
 * invoice, its store and the server policies are available.
 */
export const useCheckoutSource = (
  invoiceId: string,
): { source: CheckoutSource; connection: SocketConnectionHandle } => {
  const { data: invoice, refetch: refetchInvoice } = bitcartInvoices.useInvoiceSuspense(
    invoiceId,

    {
      query: {
        refetchInterval: ({ state: { data: invoiceData } }) =>
          isDefined(invoiceData) && bitcartInvoices.isTerminalStatus(invoiceData.status)
            ? false
            : INVOICE_DATA_REFETCH_INTERVAL_MS,
      },
    },
  )

  //* The schema allows an invoice without a store, which counts as a malformed response.
  // TODO: Drop once the API schema provides the correct type.
  if (!invoice.store_id) {
    throw new Error(`Invoice ${invoiceId} is not associated with a store`)
  }

  const { data: store } = bitcartStores.useStoreSuspense(invoice.store_id)
  const { data: policies } = bitcartManage.usePoliciesSuspense()
  const refreshInvoiceData = useCallback(() => void refetchInvoice(), [refetchInvoice])

  const { mutateAsync: updateInvoiceCustomer } = bitcartInvoices.useUpdateInvoiceCustomer()

  const submitCustomerDetails = useCallback(
    async (update: CustomerUpdateData) => {
      await updateInvoiceCustomer({ modelId: invoiceId, data: update })

      //* The refetched invoice includes the saved details, which ends the details phase.
      await refetchInvoice()
    },
    [invoiceId, refetchInvoice, updateInvoiceCustomer],
  )

  const connection = bitcartInvoices.useInvoiceWebsocket({
    invoiceId,
    status: invoice.status,
    onMessage: refreshInvoiceData,
    onConnect: refreshInvoiceData,
  })

  return { source: { invoice, store, policies, submitCustomerDetails }, connection }
}
