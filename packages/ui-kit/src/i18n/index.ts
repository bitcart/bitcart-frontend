import { SOURCE_LOCALE_ID, createLocaleLoader, type LocaleMessages } from "@bitcart/core/i18n"

import { messages as sourceLocaleMessages } from "./_generated/locales/en.po"

const loadLazyLocale = createLocaleLoader(
  import.meta.glob<{ messages: LocaleMessages }>([
    "./_generated/locales/*.po",

    //* Already in this module's chunk.
    "!./_generated/locales/en.po",
  ]),
)

/**
 * The UI Kit's catalog for the source locale, for apps that bundle their own statically.
 */
export const UI_KIT_SOURCE_LOCALE_MESSAGES: LocaleMessages = sourceLocaleMessages

/**
 * Loads the UI Kit's catalog for a locale. Apps merge it into their own catalog, passed last so
 * that the app can override the UI Kit's translations.
 */
export const loadUiKitMessages = (locale: string): Promise<LocaleMessages> =>
  locale === SOURCE_LOCALE_ID ? Promise.resolve(sourceLocaleMessages) : loadLazyLocale(locale)
