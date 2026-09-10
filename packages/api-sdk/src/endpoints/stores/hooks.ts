import type { StoresGetStoreRatesParams, StoresListItemsParams } from "#/schemas"

import {
  useStoresBatchAction,
  useStoresCreateItem,
  useStoresDeleteItem,
  useStoresGetCount,
  useStoresGetCountSuspense,
  useStoresGetItem,
  useStoresGetItemSuspense,
  useStoresGetStoreRates,
  useStoresGetStoreRatesSuspense,
  useStoresListItems,
  useStoresListItemsSuspense,
  useStoresPingEmail,
  useStoresPingEmailSuspense,
  useStoresSetStoreCheckoutSettings,
  useStoresSetStoreEmailSettings,
  useStoresSetStorePluginSettings,
  useStoresSetStoreRateRules,
  useStoresSetStoreThemeSettings,
  useStoresUpdateItem,
} from "../_internal/generated/stores"
import type { EnvelopeFreePayload, PayloadEnvelopeFreeQueryParams } from "../_internal/types"
import { stripPayloadEnvelope } from "../_internal/utils"
import type { Store } from "./types"

export const useBatchStoreAction = useStoresBatchAction

export const useCreateStore = useStoresCreateItem

export const useDeleteStore = useStoresDeleteItem

type StoreEmailPingPayload = EnvelopeFreePayload<Parameters<typeof useStoresPingEmail>[1]>

export type UsePingStoreEmailParams<TData = StoreEmailPingPayload> = {
  storeId: string
} & PayloadEnvelopeFreeQueryParams<Parameters<typeof useStoresPingEmail<TData>>[1], TData>

export const usePingStoreEmail = <TData = StoreEmailPingPayload>({
  storeId,
  options,
}: UsePingStoreEmailParams<TData>) =>
  useStoresPingEmail<TData>(storeId, {
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<StoreEmailPingPayload, TData>(options?.query?.select),
    },
  })

export type UsePingStoreEmailSuspenseParams<TData = StoreEmailPingPayload> = {
  storeId: string
} & PayloadEnvelopeFreeQueryParams<Parameters<typeof useStoresPingEmailSuspense<TData>>[1], TData>

export const usePingStoreEmailSuspense = <TData = StoreEmailPingPayload>({
  storeId,
  options,
}: UsePingStoreEmailSuspenseParams<TData>) =>
  useStoresPingEmailSuspense<TData>(storeId, {
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<StoreEmailPingPayload, TData>(options?.query?.select),
    },
  })

export const useSetStoreCheckoutSettings = useStoresSetStoreCheckoutSettings

export const useSetStoreEmailSettings = useStoresSetStoreEmailSettings

export const useSetStorePluginSettings = useStoresSetStorePluginSettings

export const useSetStoreRateRules = useStoresSetStoreRateRules

export const useSetStoreThemeSettings = useStoresSetStoreThemeSettings

export type UseStoreParams<TData = Store> = {
  storeId: string
} & PayloadEnvelopeFreeQueryParams<Parameters<typeof useStoresGetItem<TData>>[1], TData, Store>

// TODO: Convert to a direct binding once the API schema provides the correct type.
export const useStore = <TData = Store>({ storeId, options }: UseStoreParams<TData>) =>
  useStoresGetItem<TData>(storeId, {
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<Store, TData>(options?.query?.select),
    },
  })

type StoreCountPayload = EnvelopeFreePayload<Parameters<typeof useStoresGetCount>[0]>

export type UseStoreCountParams<TData = StoreCountPayload> = PayloadEnvelopeFreeQueryParams<
  Parameters<typeof useStoresGetCount<TData>>[0],
  TData
>

export const useStoreCount = <TData = StoreCountPayload>({ options }: UseStoreCountParams<TData>) =>
  useStoresGetCount<TData>({
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<StoreCountPayload, TData>(options?.query?.select),
    },
  })

export type UseStoreCountSuspenseParams<TData = StoreCountPayload> = PayloadEnvelopeFreeQueryParams<
  Parameters<typeof useStoresGetCountSuspense<TData>>[0],
  TData
>

export const useStoreCountSuspense = <TData = StoreCountPayload>({
  options,
}: UseStoreCountSuspenseParams<TData>) =>
  useStoresGetCountSuspense<TData>({
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<StoreCountPayload, TData>(options?.query?.select),
    },
  })

type StoreRatesPayload = EnvelopeFreePayload<Parameters<typeof useStoresGetStoreRates>[2]>

export type UseStoreRatesParams<TData = StoreRatesPayload> = StoresGetStoreRatesParams & {
  storeId: string
} & PayloadEnvelopeFreeQueryParams<Parameters<typeof useStoresGetStoreRates<TData>>[2], TData>

export const useStoreRates = <TData = StoreRatesPayload>({
  storeId,
  options,
  ...params
}: UseStoreRatesParams<TData>) =>
  useStoresGetStoreRates<TData>(storeId, params, {
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<StoreRatesPayload, TData>(options?.query?.select),
    },
  })

export type UseStoreRatesSuspenseParams<TData = StoreRatesPayload> = StoresGetStoreRatesParams & {
  storeId: string
} & PayloadEnvelopeFreeQueryParams<
    Parameters<typeof useStoresGetStoreRatesSuspense<TData>>[2],
    TData
  >

export const useStoreRatesSuspense = <TData = StoreRatesPayload>({
  storeId,
  options,
  ...params
}: UseStoreRatesSuspenseParams<TData>) =>
  useStoresGetStoreRatesSuspense<TData>(storeId, params, {
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<StoreRatesPayload, TData>(options?.query?.select),
    },
  })

type StoreListPayload = EnvelopeFreePayload<Parameters<typeof useStoresListItems>[1]>

export type UseStoresParams<TData = StoreListPayload> = StoresListItemsParams &
  PayloadEnvelopeFreeQueryParams<Parameters<typeof useStoresListItems<TData>>[1], TData>

export const useStores = <TData = StoreListPayload>({
  options,
  ...params
}: UseStoresParams<TData>) =>
  useStoresListItems<TData>(params, {
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<StoreListPayload, TData>(options?.query?.select),
    },
  })

export type UseStoresSuspenseParams<TData = StoreListPayload> = StoresListItemsParams &
  PayloadEnvelopeFreeQueryParams<Parameters<typeof useStoresListItemsSuspense<TData>>[1], TData>

export const useStoresSuspense = <TData = StoreListPayload>({
  options,
  ...params
}: UseStoresSuspenseParams<TData>) =>
  useStoresListItemsSuspense<TData>(params, {
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<StoreListPayload, TData>(options?.query?.select),
    },
  })

export type UseStoreSuspenseParams<TData = Store> = {
  storeId: string
} & PayloadEnvelopeFreeQueryParams<
  Parameters<typeof useStoresGetItemSuspense<TData>>[1],
  TData,
  Store
>

// TODO: Convert to a direct binding once the API schema provides the correct type.
export const useStoreSuspense = <TData = Store>({
  storeId,
  options,
}: UseStoreSuspenseParams<TData>) =>
  useStoresGetItemSuspense<TData>(storeId, {
    ...options,
    query: {
      ...options?.query,
      select: stripPayloadEnvelope<Store, TData>(options?.query?.select),
    },
  })

export const useUpdateStore = useStoresUpdateItem
