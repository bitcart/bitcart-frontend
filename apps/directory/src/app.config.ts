import { type PosixLocaleIdLike } from "@bitcart/core/utils"

export const SUPPORTED_LOCALE_IDS = [
  "be" as const,
  "de" as const,
  "en" as const,
  "es" as const,
  "fr" as const,
  "hi" as const,
  "pl" as const,
  "ru" as const,
  "tr" as const,
  "uk" as const,
] as const

export type SupportedLocaleId = (typeof SUPPORTED_LOCALE_IDS)[number]

export const POSIX_LOCALE_ID_MAP: Record<
  SupportedLocaleId,
  PosixLocaleIdLike<SupportedLocaleId>
> = {
  be: "be_BY",
  de: "de_DE",
  en: "en_US",
  es: "es_ES",
  fr: "fr_FR",
  hi: "hi_IN",
  pl: "pl_PL",
  ru: "ru_RU",
  tr: "tr_TR",
  uk: "uk_UA",
}
