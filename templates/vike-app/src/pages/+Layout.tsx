import { WebsiteLayout } from "@bitcart/ui-kit/components"
import { useHandleLocaleChange, useI18nInitialization } from "@bitcart/vike-kit/i18n"
import { Link, useClientRoute } from "@bitcart/vike-kit/navigation"
import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import { useHydrated } from "vike-react/useHydrated"

import { APP_LOCALE_IDS } from "@/app.config"

import { getLayoutConfig } from "./layout.config"

import "./uno.generated.css"

const PageShell = ({ children }: { children: React.ReactNode }) => {
  const route = useClientRoute()
  const hydrated = useHydrated()
  const handleLocaleChange = useHandleLocaleChange({ supportedLocaleIds: APP_LOCALE_IDS })

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
  useI18nInitialization({ supportedLocaleIds: APP_LOCALE_IDS })

  return (
    <I18nProvider i18n={i18n}>
      <PageShell>{children}</PageShell>
    </I18nProvider>
  )
}
