import { SOURCE_LOCALE_ID } from "@bitcart/core/constants"
import type { LocaleId } from "@bitcart/core/utils"
import { useEffect } from "react"
import { usePageContext } from "vike-react/usePageContext"
import { navigate } from "vike/client/router"

import { activateLocaleMessages } from "../effects"
import { useClientLocaleId, type UseClientLocaleIdParams } from "./client-locale"

export type I18nSetupParams<TSupportedLocaleId extends LocaleId> =
  UseClientLocaleIdParams<TSupportedLocaleId> & {}

/**
 * Configures localization application-wide.
 *
 * **Must be called exactly once in the app's root component!**
 */
export const useI18nSetup = <TSupportedLocaleId extends LocaleId>({
  supportedLocaleIds,
}: I18nSetupParams<TSupportedLocaleId>) => {
  const { localeId: pageLocaleId, urlLogical, messages } = usePageContext()
  const { clientLocaleId } = useClientLocaleId({ supportedLocaleIds })

  activateLocaleMessages(pageLocaleId, messages)

  useEffect(() => {
    if (pageLocaleId === SOURCE_LOCALE_ID && clientLocaleId !== SOURCE_LOCALE_ID) {
      void navigate(`/${clientLocaleId}` + (urlLogical === "/" ? "" : urlLogical), {
        keepScrollPosition: true,
        overwriteLastHistoryEntry: true,
      })
    }
  }, [clientLocaleId, pageLocaleId, urlLogical])
}
