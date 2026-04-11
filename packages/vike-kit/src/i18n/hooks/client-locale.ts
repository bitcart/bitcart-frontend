import { SOURCE_LOCALE_ID } from "@bitcart/core/constants"
import type { LocaleId, PseudoLocaleId } from "@bitcart/core/utils"
import { useCallback, useMemo } from "react"
import { useLocalStorage } from "usehooks-ts"

export type UseClientLocaleIdParams<TSupportedLocaleId extends LocaleId | PseudoLocaleId> = {
  supportedLocaleIds: readonly TSupportedLocaleId[]
}

/**
 * Stores locale ID in localStorage and enforces read/write validation.
 *
 * Note that if the localStorage value is invalid, the default locale ID is used.
 */
export const useClientLocaleId = <TSupportedLocaleId extends LocaleId | PseudoLocaleId>({
  supportedLocaleIds,
}: UseClientLocaleIdParams<TSupportedLocaleId>) => {
  const [persistedValue, setValue, _removeValue] = useLocalStorage<TSupportedLocaleId | undefined>(
    "localeId",
    SOURCE_LOCALE_ID as TSupportedLocaleId,
  )

  const validValue = useMemo(() => {
    if (persistedValue !== undefined && supportedLocaleIds.includes(persistedValue)) {
      return persistedValue
    } else {
      return SOURCE_LOCALE_ID
    }
  }, [persistedValue, supportedLocaleIds])

  const setValidValue = useCallback(
    (localeId: string) =>
      setValue(
        supportedLocaleIds.includes(localeId as TSupportedLocaleId)
          ? (localeId as TSupportedLocaleId)
          : (SOURCE_LOCALE_ID as TSupportedLocaleId),
      ),

    [setValue, supportedLocaleIds],
  )

  return {
    clientLocaleId: validValue,
    setClientLocaleId: setValidValue,
  }
}
