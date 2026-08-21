import type { LocaleMessages } from "@bitcart/core/i18n"
import { i18n } from "@lingui/core"

export const activateLocaleMessages = (localeId: string, messages: LocaleMessages): void => {
  if (i18n.locale !== localeId) {
    i18n.loadAndActivate({ locale: localeId, messages })
  }
}
