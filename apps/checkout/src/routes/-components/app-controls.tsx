import { useClientLocaleId, useIsClient } from "@bitcart/hooks"
import { LayoutLocaleSelector, ThemeToggle, ThemeToggleFallback } from "@bitcart/ui-kit/components"

import { APP_LOCALE_IDS } from "#/app.config"
import type { CheckoutAppConfig } from "#/checkout/runtime/context"

export const AppControls = () => {
  const { setClientLocaleId } = useClientLocaleId({ supportedLocaleIds: APP_LOCALE_IDS })
  const isClient = useIsClient()

  return (
    <div className="gap-2 flex items-center">
      <LayoutLocaleSelector abbreviateOnSmallScreens handleSelect={setClientLocaleId} />
      {isClient ? <ThemeToggle /> : <ThemeToggleFallback />}
    </div>
  )
}

export const CHECKOUT_APP_CONFIG: CheckoutAppConfig = { controls: <AppControls /> }
