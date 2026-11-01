import { createLocaleLoader, type LazyLocaleModuleCatalog } from "@bitcart/core/i18n"
import { FORM_KIT_SOURCE_LOCALE_MESSAGES, loadFormKitMessages } from "@bitcart/form-kit/i18n"
import { createLocaleActivation } from "@bitcart/tanstack-start-kit/i18n"
import { UI_KIT_SOURCE_LOCALE_MESSAGES, loadUiKitMessages } from "@bitcart/ui-kit/i18n"
import { i18n } from "@lingui/core"

import { messages as APP_SOURCE_LOCALE_MESSAGES } from "./_generated/locales/en.po"

const AVAILABLE_LOCALE_MODULES = import.meta.glob([
  "./_generated/locales/*.po",

  //* Already in the main chunk.
  "!./_generated/locales/en.po",
]) as LazyLocaleModuleCatalog

export const localeActivation = createLocaleActivation({
  i18n,

  //* The app's own catalog comes last: its translations override the packages' ones.
  catalogs: [
    { sourceMessages: UI_KIT_SOURCE_LOCALE_MESSAGES, loadMessages: loadUiKitMessages },
    { sourceMessages: FORM_KIT_SOURCE_LOCALE_MESSAGES, loadMessages: loadFormKitMessages },

    {
      sourceMessages: APP_SOURCE_LOCALE_MESSAGES,
      loadMessages: createLocaleLoader(AVAILABLE_LOCALE_MODULES),
    },
  ],
})
