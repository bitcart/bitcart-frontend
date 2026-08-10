import type { LocaleModules } from "@bitcart/vike-kit/i18n"

export const AVAILABLE_LOCALE_MODULES = import.meta.glob(
  "./_generated/locales/*.po",
) as LocaleModules
