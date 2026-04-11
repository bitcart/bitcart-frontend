import type {
  PseudoLocaleId,
  PseudoPosixLocaleId,
  PseudoPosixLocaleIdMap,
  SourceLocaleId,
} from "./utils"

export const SOURCE_LOCALE_ID: SourceLocaleId = "en"

export const PSEUDO_LOCALE_ID: PseudoLocaleId = "pseudo"

export const PSEUDO_POSIX_LOCALE_ID: PseudoPosixLocaleId = `${PSEUDO_LOCALE_ID}_LOCALE`

export const PSEUDO_POSIX_LOCALE_ID_MAP: PseudoPosixLocaleIdMap = {
  [PSEUDO_LOCALE_ID]: "pseudo_LOCALE",
}
