import { SOURCE_LOCALE_ID } from "@bitcart/core/constants"
import type { LocaleId } from "@bitcart/core/utils"
import { useLingui } from "@lingui/react"
import { useCallback } from "react"
import { navigate } from "vike/client/router"
import { usePageContext } from "vike-react/usePageContext"

import { useClientLocaleId, type UseClientLocaleIdParams } from "./client-locale"

export type UseHandleLocaleChangeParams<TSupportedLocaleId extends LocaleId> =
  UseClientLocaleIdParams<TSupportedLocaleId> & {}

export const useHandleLocaleChange = <TSupportedLocaleId extends LocaleId>({
  supportedLocaleIds,
}: UseHandleLocaleChangeParams<TSupportedLocaleId>) => {
  const { urlLogical } = usePageContext()
  const { i18n } = useLingui()
  const { setClientLocaleId } = useClientLocaleId({ supportedLocaleIds })

  return useCallback(
    (localeId: TSupportedLocaleId, callback?: VoidFunction) => {
      if (localeId === i18n.locale) {
        callback?.()
      } else {
        setClientLocaleId(localeId)
        callback?.()

        const navigationParams = {
          keepScrollPosition: true,
          overwriteLastHistoryEntry: true,
        }

        if (localeId === SOURCE_LOCALE_ID) {
          navigate(urlLogical, navigationParams)
        } else {
          navigate(`/${localeId}` + (urlLogical === "/" ? "" : urlLogical), navigationParams)
        }
      }
    },

    [i18n.locale, setClientLocaleId, urlLogical],
  )
}
