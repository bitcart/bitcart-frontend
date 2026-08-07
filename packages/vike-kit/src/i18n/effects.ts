import { i18n } from "@lingui/core"

import type { LocaleMessages, LocaleModules } from "./types"

export const createLoadCatalog = (
  availableLocaleModules: LocaleModules,
): ((locale: string) => Promise<LocaleMessages>) => {
  return async function loadCatalog(locale: string): Promise<LocaleMessages> {
    const moduleLoader = availableLocaleModules[`./_generated/locales/${locale}.po`]

    if (!moduleLoader) {
      throw new Error(`Locale module not found for ${locale}`)
    }

    const { messages } = await moduleLoader()

    console.info(`[i18n] Loaded locale ${locale} with ${Object.keys(messages).length} messages`)

    return messages
  }
}

export const activateLocaleMessages = (localeId: string, messages: LocaleMessages): void => {
  if (i18n.locale !== localeId) {
    i18n.loadAndActivate({ locale: localeId, messages })
  }
}
