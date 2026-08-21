// FIXME: Rewrite the i18n layer once a shared Tanstack Start kit package is available and stable.

import {
  SOURCE_LOCALE_ID,
  type LocaleId,
  type LocaleModuleCatalog,
  type PseudoLocaleId,
} from "@bitcart/core/i18n"
import { i18n } from "@lingui/core"

const AVAILABLE_LOCALE_MODULES = import.meta.glob("./_generated/locales/*.po", {
  eager: true,
}) as LocaleModuleCatalog

const getLocaleId = (catalogModulePath: string) =>
  catalogModulePath.replace("./_generated/locales/", "").replace(".po", "") as
    | LocaleId
    | PseudoLocaleId

export const AVAILABLE_LOCALE_IDS = Object.keys(AVAILABLE_LOCALE_MODULES).map(getLocaleId)

for (const [modulePath, { messages }] of Object.entries(AVAILABLE_LOCALE_MODULES)) {
  i18n.load(getLocaleId(modulePath), messages)
}

i18n.activate(SOURCE_LOCALE_ID)

export { i18n }
