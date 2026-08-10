import { SOURCE_LOCALE_ID } from "@bitcart/core/constants"
import type { LocaleId, PseudoLocaleId } from "@bitcart/core/utils"
import { i18n, type Messages } from "@lingui/core"

//* Catalogs are emitted by `just locales-extract(-dev)`; outside production the set
//* also contains the pseudo locale.
const AVAILABLE_LOCALE_MODULES = import.meta.glob("./_generated/locales/*.po", {
  eager: true,
}) as Record<string, { messages: Messages }>

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
