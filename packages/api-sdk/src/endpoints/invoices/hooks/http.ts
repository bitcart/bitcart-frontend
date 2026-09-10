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
import type {
  EnvelopeFreePayload,
  PayloadEnvelopeFreeQueryParams,
} from "#/endpoints/_internal/types"
import { stripPayloadEnvelope } from "#/endpoints/_internal/utils"
import type { InvoicesExportInvoicesParams, InvoicesListItemsParams } from "#/schemas"

import type { Invoice } from "../types"

export const useBatchInvoiceAction = useInvoicesBatchAction

export const useCreateInvoice = useInvoicesCreateItem

export const useDeleteInvoice = useInvoicesDeleteItem

type InvoiceExportPayload = EnvelopeFreePayload<Parameters<typeof useInvoicesExportInvoices>[1]>

export type UseExportInvoicesParams<TData = InvoiceExportPayload> = InvoicesExportInvoicesParams &
  PayloadEnvelopeFreeQueryParams<Parameters<typeof useInvoicesExportInvoices<TData>>[1], TData>

export const useExportInvoices = <TData = InvoiceExportPayload>({
  options,
  ...params
}: UseExportInvoicesParams<TData>) =>
  useInvoicesExportInvoices<TData>(params, {
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<InvoiceExportPayload, TData>(options?.query?.select),
    },
  })

export type UseExportInvoicesSuspenseParams<TData = InvoiceExportPayload> =
  InvoicesExportInvoicesParams &
    PayloadEnvelopeFreeQueryParams<
      Parameters<typeof useInvoicesExportInvoicesSuspense<TData>>[1],
      TData
    >

export const useExportInvoicesSuspense = <TData = InvoiceExportPayload>({
  options,
  ...params
}: UseExportInvoicesSuspenseParams<TData>) =>
  useInvoicesExportInvoicesSuspense<TData>(params, {
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<InvoiceExportPayload, TData>(options?.query?.select),
    },
  })

export const useGetOrCreateInvoiceByOrderId = useInvoicesGetOrCreateInvoiceByOrderId

export type UseInvoiceParams<TData = Invoice> = {
  invoiceId: string
} & PayloadEnvelopeFreeQueryParams<Parameters<typeof useInvoicesGetItem<TData>>[1], TData, Invoice>

// TODO: Convert to a direct binding once the API schema provides the correct type.
export const useInvoice = <TData = Invoice>({ invoiceId, options }: UseInvoiceParams<TData>) =>
  useInvoicesGetItem<TData>(invoiceId, {
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<Invoice, TData>(options?.query?.select),
    },
  })

type InvoiceCountPayload = EnvelopeFreePayload<Parameters<typeof useInvoicesGetCount>[0]>

export type UseInvoiceCountParams<TData = InvoiceCountPayload> = PayloadEnvelopeFreeQueryParams<
  Parameters<typeof useInvoicesGetCount<TData>>[0],
  TData
>

export const useInvoiceCount = <TData = InvoiceCountPayload>({
  options,
}: UseInvoiceCountParams<TData>) =>
  useInvoicesGetCount<TData>({
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<InvoiceCountPayload, TData>(options?.query?.select),
    },
  })

export type UseInvoiceCountSuspenseParams<TData = InvoiceCountPayload> =
  PayloadEnvelopeFreeQueryParams<Parameters<typeof useInvoicesGetCountSuspense<TData>>[0], TData>

export const useInvoiceCountSuspense = <TData = InvoiceCountPayload>({
  options,
}: UseInvoiceCountSuspenseParams<TData>) =>
  useInvoicesGetCountSuspense<TData>({
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<InvoiceCountPayload, TData>(options?.query?.select),
    },
  })

type InvoiceListPayload = EnvelopeFreePayload<Parameters<typeof useInvoicesListItems>[1]>

export type UseInvoicesParams<TData = InvoiceListPayload> = InvoicesListItemsParams &
  PayloadEnvelopeFreeQueryParams<Parameters<typeof useInvoicesListItems<TData>>[1], TData>

export const useInvoices = <TData = InvoiceListPayload>({
  options,
  ...params
}: UseInvoicesParams<TData>) =>
  useInvoicesListItems<TData>(params, {
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<InvoiceListPayload, TData>(options?.query?.select),
    },
  })

export type UseInvoicesSuspenseParams<TData = InvoiceListPayload> = InvoicesListItemsParams &
  PayloadEnvelopeFreeQueryParams<Parameters<typeof useInvoicesListItemsSuspense<TData>>[1], TData>

export const useInvoicesSuspense = <TData = InvoiceListPayload>({
  options,
  ...params
}: UseInvoicesSuspenseParams<TData>) =>
  useInvoicesListItemsSuspense<TData>(params, {
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<InvoiceListPayload, TData>(options?.query?.select),
    },
  })

export type UseInvoiceSuspenseParams<TData = Invoice> = {
  invoiceId: string
} & PayloadEnvelopeFreeQueryParams<
  Parameters<typeof useInvoicesGetItemSuspense<TData>>[1],
  TData,
  Invoice
>

// TODO: Convert to a direct binding once the API schema provides the correct type.
export const useInvoiceSuspense = <TData = Invoice>({
  invoiceId,
  options,
}: UseInvoiceSuspenseParams<TData>) =>
  useInvoicesGetItemSuspense<TData>(invoiceId, {
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<Invoice, TData>(options?.query?.select),
    },
  })

type RefundPayload = EnvelopeFreePayload<Parameters<typeof useInvoicesGetRefund>[1]>

export type UseRefundParams<TData = RefundPayload> = {
  refundId: string
} & PayloadEnvelopeFreeQueryParams<Parameters<typeof useInvoicesGetRefund<TData>>[1], TData>

export const useRefund = <TData = RefundPayload>({ refundId, options }: UseRefundParams<TData>) =>
  useInvoicesGetRefund<TData>(refundId, {
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<RefundPayload, TData>(options?.query?.select),
    },
  })

export const useRefundInvoice = useInvoicesRefundInvoice

export type UseRefundSuspenseParams<TData = RefundPayload> = {
  refundId: string
} & PayloadEnvelopeFreeQueryParams<Parameters<typeof useInvoicesGetRefundSuspense<TData>>[1], TData>

export const useRefundSuspense = <TData = RefundPayload>({
  refundId,
  options,
}: UseRefundSuspenseParams<TData>) =>
  useInvoicesGetRefundSuspense<TData>(refundId, {
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<RefundPayload, TData>(options?.query?.select),
    },
  })

export const useSubmitRefund = useInvoicesSubmitRefund

export const useUpdateInvoice = useInvoicesUpdateItem

export const useUpdateInvoiceCustomer = useInvoicesUpdateInvoice

export const useUpdateInvoicePaymentDetails = useInvoicesUpdatePaymentDetails
