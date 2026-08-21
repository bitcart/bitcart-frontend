import { useClientLocaleId } from "@bitcart/hooks"
import { useLingui } from "@lingui/react"
import { useRouter } from "@tanstack/react-router"
import { useEffect } from "react"

import { APP_LOCALE_IDS } from "#/app.config"

import { activateLocale } from "./effects"

//* FIXME: Move to a shared Tanstack Start kit package once it's created.
/**
 * Applies the visitor's persisted locale on top of the prerendered source locale.
 *
 * **Must be called exactly once in the app's root component!**
 */
export const useI18nInitialization = (): void => {
  const { i18n } = useLingui()
  const router = useRouter()
  const { clientLocaleId } = useClientLocaleId({ supportedLocaleIds: APP_LOCALE_IDS })

  useEffect(() => {
    if (clientLocaleId !== i18n.locale) {
      void activateLocale(clientLocaleId).then(() => router.invalidate())
    }
  }, [clientLocaleId, i18n.locale, router])
}
