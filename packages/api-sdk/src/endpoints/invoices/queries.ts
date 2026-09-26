import { getInvoicesGetItemSuspenseQueryOptions } from "#/endpoints/_internal/generated/invoices"

/**
 * The query options used by `useInvoiceSuspense`, for prefetching an invoice into the same
 * cache entry, e.g. from a route loader.
 */
export const invoiceQueryOptions = (invoiceId: string) =>
  getInvoicesGetItemSuspenseQueryOptions(invoiceId)
