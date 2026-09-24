import {
  useInvoicesBatchAction,
  useInvoicesCreateItem,
  useInvoicesDeleteItem,
  useInvoicesExportInvoices,
  useInvoicesExportInvoicesSuspense,
  useInvoicesGetCount,
  useInvoicesGetCountSuspense,
  useInvoicesGetItem,
  useInvoicesGetItemSuspense,
  useInvoicesGetOrCreateInvoiceByOrderId,
  useInvoicesGetRefund,
  useInvoicesGetRefundSuspense,
  useInvoicesListItems,
  useInvoicesListItemsSuspense,
  useInvoicesRefundInvoice,
  useInvoicesSubmitRefund,
  useInvoicesUpdateInvoice,
  useInvoicesUpdateItem,
  useInvoicesUpdatePaymentDetails,
} from "#/endpoints/_internal/generated/invoices"

import type { Invoice } from "../types"

export const useBatchInvoiceAction = useInvoicesBatchAction

export const useCreateInvoice = useInvoicesCreateItem

export const useDeleteInvoice = useInvoicesDeleteItem

export const useExportInvoices = useInvoicesExportInvoices

export const useExportInvoicesSuspense = useInvoicesExportInvoicesSuspense

export const useGetOrCreateInvoiceByOrderId = useInvoicesGetOrCreateInvoiceByOrderId

// TODO: Convert to a direct binding once the API schema provides the correct type.
export const useInvoice = <TData = Invoice>(
  ...params: Parameters<typeof useInvoicesGetItem<TData>>
) => useInvoicesGetItem<TData>(...params)

export const useInvoiceCount = useInvoicesGetCount

export const useInvoiceCountSuspense = useInvoicesGetCountSuspense

export const useInvoices = useInvoicesListItems

export const useInvoicesSuspense = useInvoicesListItemsSuspense

// TODO: Convert to a direct binding once the API schema provides the correct type.
export const useInvoiceSuspense = <TData = Invoice>(
  ...params: Parameters<typeof useInvoicesGetItemSuspense<TData>>
) => useInvoicesGetItemSuspense<TData>(...params)

export const useRefund = useInvoicesGetRefund

export const useRefundInvoice = useInvoicesRefundInvoice

export const useRefundSuspense = useInvoicesGetRefundSuspense

export const useSubmitRefund = useInvoicesSubmitRefund

export const useUpdateInvoice = useInvoicesUpdateItem

export const useUpdateInvoiceCustomer = useInvoicesUpdateInvoice

export const useUpdateInvoicePaymentDetails = useInvoicesUpdatePaymentDetails
