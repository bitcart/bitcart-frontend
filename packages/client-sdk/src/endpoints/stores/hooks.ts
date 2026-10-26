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
import type { Store } from "./types"

export const useBatchStoreAction = useStoresBatchAction

export const useCreateStore = useStoresCreateItem

export const useDeleteStore = useStoresDeleteItem

export const usePingStoreEmail = useStoresPingEmail

export const usePingStoreEmailSuspense = useStoresPingEmailSuspense

export const useSetStoreCheckoutSettings = useStoresSetStoreCheckoutSettings

export const useSetStoreEmailSettings = useStoresSetStoreEmailSettings

export const useSetStorePluginSettings = useStoresSetStorePluginSettings

export const useSetStoreRateRules = useStoresSetStoreRateRules

export const useSetStoreThemeSettings = useStoresSetStoreThemeSettings

// TODO: Convert to a direct binding once the API schema provides the correct type.
export const useStore = <TData = Store>(...params: Parameters<typeof useStoresGetItem<TData>>) =>
  useStoresGetItem<TData>(...params)

export const useStoreCount = useStoresGetCount

export const useStoreCountSuspense = useStoresGetCountSuspense

export const useStoreRates = useStoresGetStoreRates

export const useStoreRatesSuspense = useStoresGetStoreRatesSuspense

export const useStores = useStoresListItems

export const useStoresSuspense = useStoresListItemsSuspense

// TODO: Convert to a direct binding once the API schema provides the correct type.
export const useStoreSuspense = <TData = Store>(
  ...params: Parameters<typeof useStoresGetItemSuspense<TData>>
) => useStoresGetItemSuspense<TData>(...params)

export const useUpdateStore = useStoresUpdateItem
