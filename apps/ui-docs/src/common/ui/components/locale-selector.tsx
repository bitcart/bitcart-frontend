import type { LocaleId, PseudoLocaleId } from "@bitcart/core/i18n"
import { LocaleSelector as LocaleSelectorComponent } from "@bitcart/ui-kit/components"
import { useLingui } from "@lingui/react"
import { useCallback } from "react"

import { APP_LOCALE_IDS, localeActivation } from "@/common/i18n"

/**
 * UI Kit locale selector wired to the docs app's runtime-only locale switching:
 * there is no locale routing here, so selecting a locale simply activates its catalog.
 */
export const LocaleSelector: React.FC = () => {
  const { i18n } = useLingui()

  const handleSelectLocale = useCallback(
    (localeId: LocaleId | PseudoLocaleId, callback?: VoidFunction) => {
      void localeActivation.activateLocale(localeId)
      callback?.()
    },

    [],
  )

  if (APP_LOCALE_IDS.length < 2) {
    return null
  } else {
    return (
      <LocaleSelectorComponent
        activeLocaleId={i18n.locale as LocaleId | PseudoLocaleId}
        optionLocaleIds={APP_LOCALE_IDS}
        handleSelect={handleSelectLocale}
        triggerVariant="outline"
        classNames={{ trigger: "flex-1" }}
      />
    )
  }
}
