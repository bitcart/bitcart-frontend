import {
  SOURCE_LOCALE_ID,
  createLocaleLoader,
  type LazyLocaleModuleCatalog,
} from "@bitcart/core/i18n"
import { i18n } from "@lingui/core"

import { messages as SOURCE_LOCALE_MESSAGES } from "./_generated/locales/en.po"

const AVAILABLE_LOCALE_MODULES = import.meta.glob([
  "./_generated/locales/*.po",

  //* Already in the main chunk.
  "!./_generated/locales/en.po",
]) as LazyLocaleModuleCatalog

const loadLocale = createLocaleLoader(AVAILABLE_LOCALE_MODULES)

//* FIXME: Decouple from deps and extract to a shared Tanstack Start kit package once it's created.
/**
 * Activates the statically bundled source catalog on the global Lingui instance.
 * For client-only apps.
 *
 * **Must be called before the router is created.**
 */
export const activateSourceLocale = (): void => {
  i18n.loadAndActivate({ locale: SOURCE_LOCALE_ID, messages: SOURCE_LOCALE_MESSAGES })
}

//* FIXME: Decouple from deps and extract to a shared Tanstack Start kit package once it's created.
/**
 * Loads a catalog on demand and activates it on the global Lingui instance.
 */
export const activateLocale = async (localeId: string): Promise<void> => {
  if (i18n.locale === localeId) return void null

  i18n.loadAndActivate({
    locale: localeId,

    //* The source catalog is already in the main chunk -- don't refetch it as a lazy one.
    messages: localeId === SOURCE_LOCALE_ID ? SOURCE_LOCALE_MESSAGES : await loadLocale(localeId),
  })
}
