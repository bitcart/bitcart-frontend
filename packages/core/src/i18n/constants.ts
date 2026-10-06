import type { PseudoLocaleId, SourceLocaleId } from "./types"

export const SOURCE_LOCALE_ID: SourceLocaleId = "en"

export const PSEUDO_LOCALE_ID: PseudoLocaleId = "pseudo"

export const SUPPORTED_LOCALE_IDS = [
  "be",
  "de",
  "en",
  "es",
  "fr",
  "hi",
  "ko",
  "pl",
  "ru",
  "tr",
  "uk",
] as const
