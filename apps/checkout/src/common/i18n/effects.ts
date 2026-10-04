import {
  SOURCE_LOCALE_ID,
  createLocaleLoader,
  type LazyLocaleModuleCatalog,
} from "@bitcart/core/i18n"
import { i18n } from "@lingui/core"

import { messages as SOURCE_LOCALE_MESSAGES } from "./_generated/locales/en.po"
import { createLocaleActivation } from "./activation"

const AVAILABLE_LOCALE_MODULES = import.meta.glob([
  "./_generated/locales/*.po",

  //* Already in the main chunk.
  "!./_generated/locales/en.po",
]) as LazyLocaleModuleCatalog

const loadLocale = createLocaleLoader(AVAILABLE_LOCALE_MODULES)

const localeActivation = createLocaleActivation({
  i18n,

  //* The source catalog ships in the main chunk and is never fetched as a lazy one.
  loadAppCatalog: (localeId) =>
    localeId === SOURCE_LOCALE_ID ? Promise.resolve(SOURCE_LOCALE_MESSAGES) : loadLocale(localeId),
})

export const { registerCatalogLoader } = localeActivation

//* FIXME: Decouple from deps and extract to a shared Tanstack Start kit package once it's created.
/**
 * Activates the statically bundled source catalog on the global Lingui instance.
 * For client-only apps.
 *
 * **Must be called before the router is created.**
 */
export const activateSourceLocale = (): void => {
  i18n.load(SOURCE_LOCALE_ID, SOURCE_LOCALE_MESSAGES)
  i18n.activate(SOURCE_LOCALE_ID)
}

//* FIXME: Decouple from deps and extract to a shared Tanstack Start kit package once it's created.
/**
 * Loads a catalog on demand and activates it on the global Lingui instance.
 */
export const activateLocale = async (localeId: string): Promise<void> => {
  if (i18n.locale === localeId) return void null

  await localeActivation.activateLocale(localeId)
}
