import {
  combineLocaleLoaders,
  createLocaleLoader,
  type LazyLocaleModuleCatalog,
} from "@bitcart/core/i18n"
import { loadFormKitMessages } from "@bitcart/form-kit/i18n"
import { loadUiKitMessages } from "@bitcart/ui-kit/i18n"

const AVAILABLE_LOCALE_MODULES = import.meta.glob(
  "./_generated/locales/*.po",
) as LazyLocaleModuleCatalog

//* The app's own catalog comes last: its translations override the packages' ones.
export const loadLocale = combineLocaleLoaders(
  loadUiKitMessages,
  loadFormKitMessages,
  createLocaleLoader(AVAILABLE_LOCALE_MODULES),
)
