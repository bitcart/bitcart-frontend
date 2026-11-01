import type { LocaleId, PseudoLocaleId } from "@bitcart/core/i18n"
import { useClientLocaleId, type UseClientLocaleIdParams } from "@bitcart/hooks"
import { useLingui } from "@lingui/react"
import { useRouter } from "@tanstack/react-router"
import { useEffect } from "react"

import type { CatalogLoader, LocaleActivation } from "./activation"

export type I18nInitializationParams<TSupportedLocaleId extends LocaleId | PseudoLocaleId> =
  UseClientLocaleIdParams<TSupportedLocaleId> & {
    localeActivation: LocaleActivation
  }

/**
 * Applies the visitor's persisted locale on top of the prerendered source locale, then reruns the
 * routes' `head` and loaders in it.
 *
 * **Must be called exactly once in the app's root component!**
 */
export const useI18nInitialization = <TSupportedLocaleId extends LocaleId | PseudoLocaleId>({
  localeActivation,
  supportedLocaleIds,
}: I18nInitializationParams<TSupportedLocaleId>): void => {
  const { i18n } = useLingui()
  const router = useRouter()
  const { clientLocaleId } = useClientLocaleId({ supportedLocaleIds })

  useEffect(() => {
    if (clientLocaleId !== i18n.locale) {
      void localeActivation.activateLocale(clientLocaleId).then(() => router.invalidate())
    }
  }, [clientLocaleId, i18n.locale, localeActivation, router])
}

//! The loader must be stable: a new one re-registers.
/**
 * Keeps a catalog loader registered while the calling component is mounted.
 */
export const useCatalogLoader = (
  localeActivation: LocaleActivation,
  loader: CatalogLoader,
): void => {
  useEffect(() => localeActivation.registerCatalogLoader(loader), [localeActivation, loader])
}
