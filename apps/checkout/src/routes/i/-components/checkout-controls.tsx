import { useClientLocaleId, useIsClient } from "@bitcart/hooks"
import { LayoutLocaleSelector, ThemeToggle, ThemeToggleFallback } from "@bitcart/ui-kit/components"

import { APP_LOCALE_IDS } from "#/app.config"

export const CheckoutControls = () => {
  const { setClientLocaleId } = useClientLocaleId({ supportedLocaleIds: APP_LOCALE_IDS })
  const isClient = useIsClient()

  return (
    <div className="gap-2 flex items-center">
      <LayoutLocaleSelector handleSelect={setClientLocaleId} />
      {isClient ? <ThemeToggle /> : <ThemeToggleFallback />}
    </div>
  )
}
