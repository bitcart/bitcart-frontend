import { SOURCE_LOCALE_ID, type LocaleId, type PseudoLocaleId } from "@bitcart/core/i18n"
import { useClientLocaleId, type UseClientLocaleIdParams } from "@bitcart/hooks"
import { useEffect } from "react"
import { usePageContext } from "vike-react/usePageContext"
import { navigate } from "vike/client/router"

import { activateLocaleMessages } from "../effects"

export type I18nSetupParams<TSupportedLocaleId extends LocaleId | PseudoLocaleId> =
  UseClientLocaleIdParams<TSupportedLocaleId> & {}

/**
 * Configures localization application-wide.
 *
 * **Must be called exactly once in the app's root component!**
 */
export const useI18nInitialization = <TSupportedLocaleId extends LocaleId | PseudoLocaleId>({
  supportedLocaleIds,
}: I18nSetupParams<TSupportedLocaleId>): void => {
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
