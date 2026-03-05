import type { BCP47LanguageSubtag, BCP47LanguageTagLike, LocaleId } from "./types"

/**
 * @returns {string | undefined}
 * Endonym ISO 639 string for given language code in given language if the parameters are valid,
 * otherwise undefined
 */
export const getLanguageEndonym = (
  languageCode: BCP47LanguageSubtag | BCP47LanguageTagLike,
): string | undefined => {
  switch (languageCode.split("-").at(0)) {
    //* V8 does not have an endonym for Belarusian at the time of writing
    case "be": {
      return "беларуская"
    }

    default: {
      return new Intl.DisplayNames(languageCode, { type: "language" }).of(languageCode)
    }
  }
}

export const getLocaleDisplayName = (localeId: LocaleId): string =>
  getLanguageEndonym(localeId) ?? localeId
