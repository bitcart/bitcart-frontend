import { PSEUDO_LOCALE_ID, PSEUDO_POSIX_LOCALE_ID_MAP } from "@bitcart/core/constants"
import type { PosixLocaleIdMap, PseudoPosixLocaleIdMap } from "@bitcart/core/utils"

import { SUPPORTED_LOCALE_IDS as LOCALE_IDS } from "../constants"
import { env } from "./env"

export const SUPPORTED_LOCALE_IDS =
  env.BITCART_ENV === "production" ? LOCALE_IDS : [...LOCALE_IDS, PSEUDO_LOCALE_ID]

export const POSIX_LOCALE_ID_MAP: PosixLocaleIdMap<(typeof LOCALE_IDS)[number]> &
  (PseudoPosixLocaleIdMap | {}) = {
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

  ...(env.BITCART_ENV === "production" ? {} : PSEUDO_POSIX_LOCALE_ID_MAP),
}
