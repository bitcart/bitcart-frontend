import { bitcartInvoices, bitcartManage, bitcartStores } from "@bitcart/client-sdk/endpoints"
import type { CustomerUpdateData } from "@bitcart/client-sdk/schemas"
import { getErrorStatusCode, isNotFoundError } from "@bitcart/client-sdk/utils"
import type { SocketConnectionHandle } from "@bitcart/core/types"
import { useQueryClient, useSuspenseQueries, type QueryClient } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"
import { isDefined, isNonNull } from "remeda"

import { getRefundStatus, type CheckoutSenderAddressOutcome, type CheckoutSource } from "../model"
import type { CheckoutRefundSubmitOutcome } from "../refund/page"

const INVOICE_DATA_REFETCH_INTERVAL_MS = 30_000
const PENDING_REFUND_REFETCH_INTERVAL_MS = 30_000

/** Starts every load {@link useCheckoutSource} reads, and leaves its failures to the page. */
export const preloadCheckoutSource = (queryClient: QueryClient, invoiceId: string): void => {
  void queryClient
    .query(bitcartInvoices.invoiceQueryOptions(invoiceId))
    .then(({ store_id, refund_id }) =>
      Promise.all([
        store_id ? queryClient.query(bitcartStores.storeQueryOptions(store_id)) : undefined,
        refund_id ? queryClient.query(bitcartInvoices.refundQueryOptions(refund_id)) : undefined,
      ]),
    )
    .catch(() => undefined)

  void queryClient.query(bitcartManage.policiesQueryOptions()).catch(() => undefined)
}

/**
 * Loads the data required by an invoice's checkout and keeps it current. Suspends until the
 * invoice, its store, the server policies and the invoice's refund, if any, are available.
 */
export const useCheckoutSource = (
  invoiceId: string,
): { source: CheckoutSource; connection: SocketConnectionHandle } => {
  const {
    data: invoice,
    failureReason: invoiceFailureReason,
    refetch: refetchInvoice,
  } = bitcartInvoices.useInvoiceSuspense(
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

  //* A suspense query stops throwing once it holds data: a 404 on a later fetch never reaches an
  //* error boundary by itself. `failureReason` holds that failure from the first failed attempt,
  //* before the retries are exhausted.
  if (isNotFoundError(invoiceFailureReason)) throw invoiceFailureReason

  //* The schema allows an invoice without a store, which counts as a malformed response.
  // TODO: Drop once the API schema provides the correct type.
  if (!invoice.store_id) {
    throw new Error(`Invoice ${invoiceId} is not associated with a store`)
  }

  const { data: store } = bitcartStores.useStoreSuspense(invoice.store_id)
  const { data: policies } = bitcartManage.usePoliciesSuspense()

  const refund = useSuspenseQueries({
    queries: [invoice.refund_id]
      .filter(isNonNull)
      .map((refundId) => bitcartInvoices.refundQueryOptions(refundId)),

    combine: ([refundQuery]) => refundQuery?.data,
  })

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

  const { mutateAsync: updatePaymentDetails } = bitcartInvoices.useUpdateInvoicePaymentDetails()

  const submitSenderAddress = useCallback(
    async (methodId: string, address: string): Promise<CheckoutSenderAddressOutcome> => {
      try {
        await updatePaymentDetails({ modelId: invoiceId, data: { id: methodId, address } })
      } catch (error) {
        if (getErrorStatusCode(error) !== 422) throw error

        const { data: current } = await refetchInvoice({ throwOnError: true })

        if (!current) throw error

        const method = current.payments.find(({ id }) => id === methodId)

        return current.status !== "pending" || !method || method.user_address
          ? "accepted"
          : "rejected"
      }

      await refetchInvoice()

      return "accepted"
    },
    [invoiceId, refetchInvoice, updatePaymentDetails],
  )

  const connection = bitcartInvoices.useInvoiceWebsocket({
    invoiceId,
    status: invoice.status,
    onMessage: refreshInvoiceData,
    onConnect: refreshInvoiceData,
  })

  const source = useMemo(
    () => ({ invoice, store, policies, refund, submitCustomerDetails, submitSenderAddress }),
    [invoice, store, policies, refund, submitCustomerDetails, submitSenderAddress],
  )

  return { source, connection }
}

export const preloadRefundSource = (queryClient: QueryClient, refundId: string): void => {
  void queryClient
    .query(bitcartInvoices.refundQueryOptions(refundId))
    .then(({ invoice_id }) => {
      if (invoice_id) preloadCheckoutSource(queryClient, invoice_id)
    })
    .catch(() => undefined)
}

export const useRefundSource = (refundId: string) => {
  const queryClient = useQueryClient()

  const { data: refund, refetch } = bitcartInvoices.useRefundSuspense(refundId, {
    query: {
      refetchInterval: ({ state: { data } }) =>
        data && getRefundStatus(data.payout_status) === "pending"
          ? PENDING_REFUND_REFETCH_INTERVAL_MS
          : false,
    },
  })

  const { mutateAsync: submitRefund } = bitcartInvoices.useSubmitRefund()

  const submit = useCallback(
    async (destination: string): Promise<CheckoutRefundSubmitOutcome> => {
      try {
        const submitted = await submitRefund({ refundId, data: { destination } })

        queryClient.setQueryData(bitcartInvoices.refundQueryOptions(refundId).queryKey, submitted)

        return "accepted"
      } catch (error) {
        if (getErrorStatusCode(error) !== 422) throw error

        const { data: current } = await refetch({ throwOnError: true })

        if (!current) throw error

        return current.payout_id || !current.invoice_id ? "accepted" : "rejected"
      }
    },
    [queryClient, refetch, refundId, submitRefund],
  )

  return { refund, submit }
}
