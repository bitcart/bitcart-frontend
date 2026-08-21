import { createLocaleLoader, type LazyLocaleModuleCatalog } from "@bitcart/core/i18n"

const AVAILABLE_LOCALE_MODULES = import.meta.glob(
  "./_generated/locales/*.po",
) as LazyLocaleModuleCatalog

export const loadLocale = createLocaleLoader(AVAILABLE_LOCALE_MODULES)
