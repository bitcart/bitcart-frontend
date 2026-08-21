import {
  SOURCE_LOCALE_ID,
  type LocaleId,
  type PseudoLocaleId,
  type SourceLocaleId,
} from "@bitcart/core/i18n"
import { useLocalStorage } from "@mantine/hooks"
import { useCallback, useMemo } from "react"

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
}: UseClientLocaleIdParams<TSupportedLocaleId>): {
  clientLocaleId: TSupportedLocaleId | SourceLocaleId
  setClientLocaleId: (localeId: string) => void
} => {
  const [persistedValue, setValue, _removeValue] = useLocalStorage<TSupportedLocaleId | undefined>({
    key: "localeId",
    defaultValue: SOURCE_LOCALE_ID as TSupportedLocaleId,

    //* Read localStorage synchronously during useState init instead of in a post-mount effect,
    //* which helps to avoid unnecessary rerenders.
    getInitialValueInEffect: false,
  })

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
