import { defineLibLinguiConfig } from "@bitcart/configs/by-package-type/lib-lingui"
import { PSEUDO_LOCALE_ID, SOURCE_LOCALE_ID, SUPPORTED_LOCALE_IDS } from "@bitcart/core/i18n"

export default defineLibLinguiConfig({
  sourceLocale: SOURCE_LOCALE_ID,
  locales: SUPPORTED_LOCALE_IDS,
  pseudoLocale: PSEUDO_LOCALE_ID,
})
