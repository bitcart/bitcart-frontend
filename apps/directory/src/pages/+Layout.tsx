import { WebsiteLayout } from "@bitcart/ui-kit/components"
import { useHandleLocaleChange, useI18nSetup } from "@bitcart/vike-kit/i18n"
import { HashAutoscrollProvider, Link, useRoute } from "@bitcart/vike-kit/navigation"
import { createUseMatomoTracking } from "@bitcart/vike-kit/telemetry"
import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import { useHydrated } from "vike-react/useHydrated"

import { SUPPORTED_LOCALE_IDS } from "@/app.config"
import { IS_MATOMO_ENABLED } from "@/common/constants"
import { env } from "@/env"

import { getLayoutConfig } from "./layout.config"

import "./uno.generated.css"

const useMatomoTracking = createUseMatomoTracking({
  enabled: IS_MATOMO_ENABLED,
  url: env.BITCART_MATOMO_URL,
  scriptUrl: env.BITCART_MATOMO_SCRIPT_URL,
  siteId: env.BITCART_MATOMO_ID,
  actions: env.BITCART_MATOMO_ACTIONS,
})

const PageShell = ({ children }: { children: React.ReactNode }) => {
  const route = useRoute()
  const hydrated = useHydrated()
  const handleLocaleChange = useHandleLocaleChange({ supportedLocaleIds: SUPPORTED_LOCALE_IDS })

  return (
    <WebsiteLayout
      LinkComponent={Link}
      currentRoute={route}
      config={getLayoutConfig()}
      isHydrated={hydrated}
      localeChangeHandler={handleLocaleChange}
    >
      {children}
    </WebsiteLayout>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  useI18nSetup({ supportedLocaleIds: SUPPORTED_LOCALE_IDS })
  useMatomoTracking()

  return (
    <I18nProvider i18n={i18n}>
      <HashAutoscrollProvider>
        <PageShell>{children}</PageShell>
      </HashAutoscrollProvider>
    </I18nProvider>
  )
}
