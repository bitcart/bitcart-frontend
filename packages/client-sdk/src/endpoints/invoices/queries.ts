import {
  getInvoicesGetItemSuspenseQueryOptions,
  getInvoicesGetRefundSuspenseQueryOptions,
} from "#/endpoints/_internal/generated/invoices"

/**
 * The query options used by `useInvoiceSuspense`, for prefetching an invoice into the same
 * cache entry, e.g. from a route loader.
 */
export const invoiceQueryOptions = (invoiceId: string) =>
  getInvoicesGetItemSuspenseQueryOptions(invoiceId)

/** The query options used by `useRefundSuspense`, for loading a refund alongside its invoice. */
export const refundQueryOptions = (refundId: string) =>
  getInvoicesGetRefundSuspenseQueryOptions(refundId)
